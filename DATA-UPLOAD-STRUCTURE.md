# Data Upload Structure - PostgreSQL Neon DB

## Overview
This document outlines the complete structure for implementing data upload functionality using PostgreSQL Neon DB with Drizzle ORM in a Next.js application.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [File Upload Flow](#file-upload-flow)
6. [Implementation Steps](#implementation-steps)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)

---

## Project Structure

```
project-root/
├── app/
│   └── api/
│       └── upload/
│           ├── route.ts              # Main upload API endpoint
│           ├── bulk/
│           │   └── route.ts          # Bulk upload endpoint
│           └── validate/
│               └── route.ts          # Data validation endpoint
├── db/
│   ├── schema.ts                     # Database schema definitions
│   ├── drizzle.ts                    # Drizzle client instance
│   └── upload-helpers.ts             # Upload utility functions
├── lib/
│   ├── upload/
│   │   ├── parser.ts                 # CSV/Excel parsing utilities
│   │   ├── validator.ts              # Data validation logic
│   │   └── transformer.ts            # Data transformation utilities
│   └── types/
│       └── upload.ts                 # TypeScript types for uploads
├── components/
│   └── upload/
│       ├── data-uploader.tsx         # Main upload component
│       ├── file-dropzone.tsx         # Drag & drop zone
│       ├── upload-progress.tsx       # Progress indicator
│       ├── validation-results.tsx    # Validation feedback
│       └── upload-history.tsx        # Upload history display
└── features/
    └── data-upload/
        ├── api/
        │   ├── use-upload-data.ts    # React Query hook for upload
        │   └── use-upload-history.ts # Hook for upload history
        └── hooks/
            └── use-file-parser.ts    # Custom hook for file parsing
```

---

## Database Schema

### 1. Upload History Table
Track all upload operations for auditing and history.

```typescript
// db/schema.ts

import { pgTable, text, timestamp, integer, jsonb, uuid, pgEnum } from 'drizzle-orm/pg-core';

// Upload status enum
export const uploadStatusEnum = pgEnum('upload_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'partial'
]);

// Main upload history table
export const uploadHistory = pgTable('upload_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // From auth
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  fileType: text('file_type').notNull(), // csv, xlsx, json
  targetTable: text('target_table').notNull(),
  status: uploadStatusEnum('status').default('pending').notNull(),
  totalRows: integer('total_rows').default(0),
  successfulRows: integer('successful_rows').default(0),
  failedRows: integer('failed_rows').default(0),
  errorLog: jsonb('error_log').$type<Array<{
    row: number;
    error: string;
    data: any;
  }>>(),
  metadata: jsonb('metadata').$type<{
    columnMapping?: Record<string, string>;
    transformations?: string[];
    validationRules?: string[];
  }>(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Upload staging table (temporary storage before validation)
export const uploadStaging = pgTable('upload_staging', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploadId: uuid('upload_id').references(() => uploadHistory.id, { onDelete: 'cascade' }),
  rowNumber: integer('row_number').notNull(),
  rawData: jsonb('raw_data').notNull(),
  validatedData: jsonb('validated_data'),
  validationErrors: jsonb('validation_errors').$type<string[]>(),
  status: text('status').default('pending'), // pending, valid, invalid
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 2. Data Tables
Your actual business data tables (example):

```typescript
// Example: Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').unique().notNull(),
  description: text('description'),
  price: integer('price').notNull(), // in cents
  quantity: integer('quantity').default(0),
  category: text('category'),
  uploadId: uuid('upload_id').references(() => uploadHistory.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Example: Customers table
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  address: text('address'),
  uploadId: uuid('upload_id').references(() => uploadHistory.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

---

## API Endpoints

### 1. Main Upload Endpoint
**POST** `/api/upload`

```typescript
// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { uploadHistory, uploadStaging } from '@/db/schema';

/**
 * Handles file upload and initial processing
 * 
 * Request Body (FormData):
 * - file: File (CSV, XLSX, JSON)
 * - targetTable: string (table name to upload to)
 * - options: JSON string with upload options
 * 
 * Response:
 * {
 *   uploadId: string,
 *   status: string,
 *   message: string,
 *   totalRows: number
 * }
 */
export async function POST(req: NextRequest) {
  // Implementation structure
}
```

### 2. Bulk Upload Endpoint
**POST** `/api/upload/bulk`

```typescript
// app/api/upload/bulk/route.ts

/**
 * Handles bulk data insertion after validation
 * 
 * Request Body:
 * {
 *   uploadId: string,
 *   targetTable: string,
 *   data: Array<Record<string, any>>,
 *   mode: 'insert' | 'upsert' | 'update'
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   inserted: number,
 *   updated: number,
 *   failed: number,
 *   errors: Array<{ row: number, error: string }>
 * }
 */
export async function POST(req: NextRequest) {
  // Implementation structure
}
```

### 3. Validation Endpoint
**POST** `/api/upload/validate`

```typescript
// app/api/upload/validate/route.ts

/**
 * Validates uploaded data against schema rules
 * 
 * Request Body:
 * {
 *   uploadId: string,
 *   targetTable: string,
 *   validationRules?: Object
 * }
 * 
 * Response:
 * {
 *   valid: boolean,
 *   totalRows: number,
 *   validRows: number,
 *   invalidRows: number,
 *   errors: Array<{ row: number, field: string, error: string }>
 * }
 */
export async function POST(req: NextRequest) {
  // Implementation structure
}
```

### 4. Upload History Endpoint
**GET** `/api/upload/history`

```typescript
// app/api/upload/history/route.ts

/**
 * Retrieves upload history for the authenticated user
 * 
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - status: string (filter by status)
 * - targetTable: string (filter by table)
 * 
 * Response:
 * {
 *   uploads: Array<UploadHistory>,
 *   total: number,
 *   page: number,
 *   limit: number
 * }
 */
export async function GET(req: NextRequest) {
  // Implementation structure
}
```

---

## Frontend Components

### 1. Main Data Uploader Component

```typescript
// components/upload/data-uploader.tsx

/**
 * Main upload component with drag & drop functionality
 * 
 * Features:
 * - File drag & drop
 * - File type validation (CSV, XLSX, JSON)
 * - Size limit checking
 * - Preview of first few rows
 * - Column mapping interface
 * - Progress tracking
 * - Error display
 * 
 * Props:
 * - targetTable: string
 * - maxFileSize?: number (default: 10MB)
 * - acceptedFormats?: string[]
 * - onSuccess?: (uploadId: string) => void
 * - onError?: (error: Error) => void
 */

interface DataUploaderProps {
  targetTable: string;
  maxFileSize?: number;
  acceptedFormats?: string[];
  onSuccess?: (uploadId: string) => void;
  onError?: (error: Error) => void;
}

export function DataUploader({ targetTable, ...props }: DataUploaderProps) {
  // Component structure
}
```

### 2. File Dropzone Component

```typescript
// components/upload/file-dropzone.tsx

/**
 * Drag and drop zone for file uploads
 * 
 * Features:
 * - Visual feedback on drag over
 * - File type filtering
 * - Multiple file support (optional)
 * - Click to browse alternative
 * 
 * Props:
 * - accept: string (MIME types)
 * - maxSize: number (bytes)
 * - multiple?: boolean
 * - onDrop: (files: File[]) => void
 * - disabled?: boolean
 */

interface FileDropzoneProps {
  accept: string;
  maxSize: number;
  multiple?: boolean;
  onDrop: (files: File[]) => void;
  disabled?: boolean;
}

export function FileDropzone({ onDrop, ...props }: FileDropzoneProps) {
  // Component structure
}
```

### 3. Upload Progress Component

```typescript
// components/upload/upload-progress.tsx

/**
 * Display upload and processing progress
 * 
 * Features:
 * - Progress bar
 * - Current status message
 * - Percentage complete
 * - Cancel option
 * - Time estimates
 * 
 * Props:
 * - progress: number (0-100)
 * - status: string
 * - currentRow?: number
 * - totalRows?: number
 * - onCancel?: () => void
 */

interface UploadProgressProps {
  progress: number;
  status: string;
  currentRow?: number;
  totalRows?: number;
  onCancel?: () => void;
}

export function UploadProgress({ progress, ...props }: UploadProgressProps) {
  // Component structure
}
```

### 4. Validation Results Component

```typescript
// components/upload/validation-results.tsx

/**
 * Display validation results and errors
 * 
 * Features:
 * - Summary of valid/invalid rows
 * - Detailed error list
 * - Option to download error report
 * - Row-by-row error display
 * - Ability to fix and re-validate
 * 
 * Props:
 * - uploadId: string
 * - validRows: number
 * - invalidRows: number
 * - errors: ValidationError[]
 * - onRevalidate?: () => void
 * - onProceed?: () => void
 */

interface ValidationResultsProps {
  uploadId: string;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  onRevalidate?: () => void;
  onProceed?: () => void;
}

export function ValidationResults({ errors, ...props }: ValidationResultsProps) {
  // Component structure
}
```

### 5. Column Mapping Component

```typescript
// components/upload/column-mapper.tsx

/**
 * Map CSV columns to database fields
 * 
 * Features:
 * - Source-to-target column mapping
 * - Auto-detection of similar names
 * - Preview of mapped data
 * - Required field highlighting
 * - Data transformation options
 * 
 * Props:
 * - sourceColumns: string[]
 * - targetSchema: SchemaDefinition
 * - onMappingChange: (mapping: Record<string, string>) => void
 * - initialMapping?: Record<string, string>
 */

interface ColumnMapperProps {
  sourceColumns: string[];
  targetSchema: SchemaDefinition;
  onMappingChange: (mapping: Record<string, string>) => void;
  initialMapping?: Record<string, string>;
}

export function ColumnMapper({ sourceColumns, ...props }: ColumnMapperProps) {
  // Component structure
}
```

---

## File Upload Flow

### Step-by-Step Process

```
1. USER ACTION: Select/Drop File
   └─> Trigger: FileDropzone component
   └─> Validation: Check file type, size
   └─> Output: File object

2. FILE PARSING
   └─> Read file contents
   └─> Parse based on type (CSV/XLSX/JSON)
   └─> Extract headers/columns
   └─> Preview first 5-10 rows
   └─> Output: Parsed data array

3. COLUMN MAPPING (Optional)
   └─> Display source columns
   └─> Match to target schema
   └─> Allow user adjustments
   └─> Apply transformations
   └─> Output: Column mapping object

4. UPLOAD TO SERVER
   └─> POST to /api/upload
   └─> Create upload_history record
   └─> Store raw data in upload_staging
   └─> Return uploadId
   └─> Output: { uploadId, status }

5. VALIDATION
   └─> POST to /api/upload/validate
   └─> Check data types
   └─> Verify required fields
   └─> Check unique constraints
   └─> Validate business rules
   └─> Update staging records
   └─> Output: Validation results

6. USER REVIEW
   └─> Display validation results
   └─> Show errors (if any)
   └─> Option to fix errors
   └─> Option to proceed with valid rows
   └─> User decision: Proceed/Cancel

7. BULK INSERT
   └─> POST to /api/upload/bulk
   └─> Insert valid records
   └─> Handle conflicts (upsert logic)
   └─> Update upload_history
   └─> Clean up staging data
   └─> Output: { success, stats }

8. COMPLETION
   └─> Show success message
   └─> Display statistics
   └─> Offer download of error log
   └─> Update UI with new data
```

---

## Implementation Steps

### Phase 1: Database Setup

```bash
# 1. Update schema.ts with upload tables
# Add uploadHistory, uploadStaging tables

# 2. Generate migration
pnpm db:generate

# 3. Run migration
pnpm db:migrate

# 4. Verify in Drizzle Studio
pnpm db:studio
```

### Phase 2: Backend API Development

```typescript
// Recommended order:

// 1. Create helper utilities (lib/upload/)
- parser.ts       // CSV/Excel parsing
- validator.ts    // Data validation
- transformer.ts  // Data transformation

// 2. Create upload helpers (db/upload-helpers.ts)
- createUploadRecord()
- stageUploadData()
- validateStagedData()
- bulkInsertData()
- updateUploadStatus()

// 3. Implement API routes
- app/api/upload/route.ts          // Main upload
- app/api/upload/validate/route.ts  // Validation
- app/api/upload/bulk/route.ts      // Bulk insert
- app/api/upload/history/route.ts   // History
```

### Phase 3: Frontend Development

```typescript
// Recommended order:

// 1. Create React Query hooks (features/data-upload/api/)
- use-upload-data.ts
- use-validate-data.ts
- use-bulk-insert.ts
- use-upload-history.ts

// 2. Build UI components (components/upload/)
- file-dropzone.tsx
- upload-progress.tsx
- validation-results.tsx
- column-mapper.tsx
- data-uploader.tsx (main)

// 3. Create page/route to use the uploader
- app/(inventory)/upload/page.tsx
```

### Phase 4: Testing & Optimization

```typescript
// 1. Test with various file formats
- Small CSV (< 100 rows)
- Large CSV (> 10,000 rows)
- Excel files (.xlsx)
- JSON files

// 2. Test error scenarios
- Invalid data types
- Missing required fields
- Duplicate entries
- Malformed files

// 3. Performance optimization
- Batch inserts (chunks of 1000)
- Database indexing
- Progress tracking
- Memory management

// 4. Security testing
- File size limits
- File type validation
- SQL injection prevention
- Authorization checks
```

---

## Error Handling

### Client-Side Errors

```typescript
// File validation errors
const FILE_ERRORS = {
  TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_TYPE: 'File type not supported',
  PARSE_ERROR: 'Unable to parse file',
  EMPTY_FILE: 'File contains no data',
  INVALID_HEADERS: 'File headers do not match expected format',
};

// Network errors
const NETWORK_ERRORS = {
  UPLOAD_FAILED: 'Failed to upload file',
  TIMEOUT: 'Upload timeout - please try again',
  CONNECTION_ERROR: 'Network connection error',
};

// Validation errors
const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'Required field is missing',
  INVALID_FORMAT: 'Data format is invalid',
  DUPLICATE_VALUE: 'Duplicate value found',
  CONSTRAINT_VIOLATION: 'Data violates constraint',
};
```

### Server-Side Error Handling

```typescript
// app/api/upload/route.ts

try {
  // Upload logic
} catch (error) {
  // Log error
  console.error('Upload error:', error);
  
  // Update upload status
  await db.update(uploadHistory)
    .set({ 
      status: 'failed',
      errorLog: [{ error: error.message }] 
    })
    .where(eq(uploadHistory.id, uploadId));
  
  // Return error response
  return NextResponse.json({
    error: 'Upload failed',
    message: error.message,
    uploadId
  }, { status: 500 });
}
```

### Error Recovery Strategies

```typescript
// 1. Partial Success
- Insert valid rows
- Log failed rows with errors
- Allow download of error report
- Option to fix and re-upload failed rows

// 2. Transaction Rollback
- For critical tables, use transactions
- Rollback all changes on error
- Maintain data integrity

// 3. Retry Logic
- Automatic retry for network errors
- Exponential backoff
- Maximum retry attempts

// 4. User Notifications
- Real-time error feedback
- Detailed error messages
- Suggested fixes
- Support contact information
```

---

## Security Considerations

### 1. File Upload Security

```typescript
// Maximum file size
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed MIME types
const ALLOWED_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
];

// File validation
function validateFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  return true;
}
```

### 2. Authentication & Authorization

```typescript
// Verify user authentication
const { userId } = auth();
if (!userId) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

// Check user permissions
const hasPermission = await checkUploadPermission(userId, targetTable);
if (!hasPermission) {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}
```

### 3. Data Sanitization

```typescript
// Sanitize input data
function sanitizeData(data: any): any {
  // Remove HTML tags
  // Escape special characters
  // Trim whitespace
  // Validate data types
  return sanitized;
}

// Prevent SQL injection
// Use Drizzle ORM parameterized queries (automatic protection)
await db.insert(products).values(sanitizedData);
```

### 4. Rate Limiting

```typescript
// Limit upload frequency per user
const RATE_LIMIT = {
  maxUploadsPerHour: 10,
  maxUploadsPerDay: 50,
};

// Check rate limit
const recentUploads = await db.select()
  .from(uploadHistory)
  .where(
    and(
      eq(uploadHistory.userId, userId),
      gte(uploadHistory.createdAt, new Date(Date.now() - 3600000))
    )
  );

if (recentUploads.length >= RATE_LIMIT.maxUploadsPerHour) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

### 5. Data Validation

```typescript
// Use Zod for schema validation
import { z } from 'zod';

const ProductUploadSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().regex(/^[A-Z0-9-]+$/),
  price: z.number().positive(),
  quantity: z.number().int().nonnegative(),
  category: z.string().optional(),
});

// Validate each row
function validateRow(row: any, schema: z.Schema) {
  try {
    return schema.parse(row);
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
}
```

---

## TypeScript Types

```typescript
// lib/types/upload.ts

export type UploadStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'partial';

export type UploadMode = 
  | 'insert'    // Only insert new records
  | 'upsert'    // Insert or update if exists
  | 'update';   // Only update existing records

export interface UploadOptions {
  targetTable: string;
  mode: UploadMode;
  batchSize?: number;
  skipErrors?: boolean;
  columnMapping?: Record<string, string>;
  transformations?: DataTransformation[];
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface UploadResult {
  uploadId: string;
  status: UploadStatus;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ValidationError[];
  processedAt: Date;
}

export interface DataTransformation {
  field: string;
  type: 'trim' | 'uppercase' | 'lowercase' | 'parse-date' | 'parse-number';
  options?: Record<string, any>;
}

export interface ColumnMapping {
  source: string;
  target: string;
  transform?: DataTransformation;
  required: boolean;
}

export interface ParsedFileData {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  previewRows: Record<string, any>[];
}
```

---

## Best Practices

### 1. Performance Optimization

```typescript
// Batch inserts for large datasets
const BATCH_SIZE = 1000;

async function bulkInsert(data: any[], table: any) {
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await db.insert(table).values(batch);
    
    // Update progress
    const progress = Math.round((i / data.length) * 100);
    await updateProgress(uploadId, progress);
  }
}
```

### 2. Memory Management

```typescript
// Stream large files instead of loading entirely
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';

function streamParse(filePath: string) {
  return new Promise((resolve, reject) => {
    const results = [];
    createReadStream(filePath)
      .pipe(parse({ columns: true }))
      .on('data', (row) => {
        // Process row immediately
        processRow(row);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}
```

### 3. Progress Tracking

```typescript
// Real-time progress updates
export async function uploadWithProgress(
  data: any[],
  onProgress: (progress: number) => void
) {
  for (let i = 0; i < data.length; i++) {
    await processRow(data[i]);
    
    const progress = Math.round(((i + 1) / data.length) * 100);
    onProgress(progress);
  }
}
```

### 4. Logging & Monitoring

```typescript
// Comprehensive logging
interface UploadLog {
  uploadId: string;
  timestamp: Date;
  event: string;
  details: any;
}

async function logUploadEvent(log: UploadLog) {
  console.log(`[UPLOAD ${log.uploadId}] ${log.event}`, log.details);
  
  // Store in database or external service
  await db.insert(uploadLogs).values(log);
}
```

---

## Example Usage

### Complete Upload Flow Example

```typescript
// app/(inventory)/products/upload/page.tsx

'use client';

import { useState } from 'react';
import { DataUploader } from '@/components/upload/data-uploader';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProductUploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSuccess = (uploadId: string) => {
    toast.success('Products uploaded successfully!');
    router.push(`/products`);
  };

  const handleUploadError = (error: Error) => {
    toast.error(`Upload failed: ${error.message}`);
    setIsUploading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Products</h1>
      
      <DataUploader
        targetTable="products"
        maxFileSize={10 * 1024 * 1024} // 10MB
        acceptedFormats={['csv', 'xlsx']}
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
      />
    </div>
  );
}
```

---

## Environment Variables

```bash
# .env.local

# Neon PostgreSQL Database URL
POSTGRES_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Upload Configuration
MAX_UPLOAD_SIZE_MB=10
ALLOWED_FILE_TYPES="csv,xlsx,json"
UPLOAD_RATE_LIMIT_HOUR=10
UPLOAD_RATE_LIMIT_DAY=50

```

---

## Testing Checklist

- [ ] File upload with valid CSV
- [ ] File upload with valid XLSX
- [ ] File upload with valid JSON
- [ ] File size limit enforcement
- [ ] File type validation
- [ ] Large file handling (>10k rows)
- [ ] Column mapping functionality
- [ ] Data validation rules
- [ ] Error handling and display
- [ ] Progress tracking
- [ ] Partial success handling
- [ ] Upload history display
- [ ] Authentication checks
- [ ] Authorization checks
- [ ] Rate limiting
- [ ] Duplicate detection
- [ ] Transaction rollback on error
- [ ] Memory usage with large files
- [ ] Concurrent uploads
- [ ] Network error recovery

---

## Additional Resources

### Libraries to Install

```bash
# File parsing
pnpm add papaparse xlsx
pnpm add -D @types/papaparse

# Form handling
pnpm add react-hook-form @hookform/resolvers

# File upload
pnpm add react-dropzone

# Progress indicators
# (Already have @radix-ui/react-progress)

# Validation
# (Already have zod)
```

### Useful Documentation

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Neon Database Docs](https://neon.tech/docs)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Query](https://tanstack.com/query/latest)
- [PapaParse (CSV)](https://www.papaparse.com/)
- [SheetJS (Excel)](https://sheetjs.com/)

---

## Support & Maintenance

### Monitoring Upload Health

```typescript
// Create dashboard for upload monitoring
- Total uploads (daily/weekly/monthly)
- Success rate
- Average processing time
- Common error types
- Popular upload tables
- User activity
```

### Maintenance Tasks

```typescript
// Regular cleanup of staging data
async function cleanupStagingData() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  await db.delete(uploadStaging)
    .where(lt(uploadStaging.createdAt, thirtyDaysAgo));
}

// Archive old upload history
async function archiveOldUploads() {
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  
  // Move to archive table or external storage
  const oldUploads = await db.select()
    .from(uploadHistory)
    .where(lt(uploadHistory.createdAt, sixMonthsAgo));
  
  // Archive and delete
}
```

---

## Conclusion

This structure provides a comprehensive, production-ready data upload system with:

✅ **Robust database schema** for tracking uploads and staging data  
✅ **Complete API layer** with validation and error handling  
✅ **Reusable frontend components** with excellent UX  
✅ **Security best practices** built-in  
✅ **Performance optimization** for large datasets  
✅ **Comprehensive error handling** and recovery  
✅ **Full TypeScript support** for type safety  

Implement this structure step-by-step, test thoroughly, and scale as needed for your specific use case.

