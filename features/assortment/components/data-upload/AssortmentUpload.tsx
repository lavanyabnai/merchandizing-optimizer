"use client";

import { useState, useMemo, useCallback } from "react";
import { useCSVReader } from "react-papaparse";
import { Upload, FileSpreadsheet, Check, X, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ColumnMapper } from "./ColumnMapper";
import type { UploadConfig, ColumnConfig } from "./upload-configs";

type UploadState = "IDLE" | "FILE_SELECTED" | "MAPPING" | "PREVIEW" | "IMPORTING";

interface AssortmentUploadProps {
  config: UploadConfig;
  onUpload: (data: Record<string, unknown>[]) => void;
  isLoading: boolean;
  currentCount?: number;
}

/**
 * Convert a raw CSV string value to the appropriate type
 * based on the column config.
 */
function coerceValue(
  value: string | undefined | null,
  colConfig: ColumnConfig
): unknown {
  if (value === undefined || value === null || value === "") {
    return colConfig.required ? undefined : null;
  }

  const trimmed = value.trim();

  switch (colConfig.type) {
    case "number": {
      const num = Number(trimmed);
      return isNaN(num) ? undefined : num;
    }
    case "boolean": {
      const lower = trimmed.toLowerCase();
      if (["true", "1", "yes", "y"].includes(lower)) return true;
      if (["false", "0", "no", "n", ""].includes(lower)) return false;
      return undefined;
    }
    default:
      return trimmed;
  }
}

export function AssortmentUpload({
  config,
  onUpload,
  isLoading,
  currentCount,
}: AssortmentUploadProps) {
  const { CSVReader } = useCSVReader();

  const [state, setState] = useState<UploadState>("IDLE");
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");

  const requiredFields = useMemo(
    () => config.columns.filter((col) => col.required),
    [config.columns]
  );

  const mappedFields = useMemo(
    () => new Set(Object.values(mapping)),
    [mapping]
  );

  const allRequiredMapped = useMemo(
    () => requiredFields.every((col) => mappedFields.has(col.key)),
    [requiredFields, mappedFields]
  );

  /**
   * Transform raw CSV rows using the current column mapping.
   */
  const transformedData = useMemo(() => {
    if (csvData.length === 0 || Object.keys(mapping).length === 0) return [];

    const colConfigMap = new Map(config.columns.map((c) => [c.key, c]));

    return csvData.map((row) => {
      const record: Record<string, unknown> = {};

      for (const [csvHeader, fieldKey] of Object.entries(mapping)) {
        const colIndex = csvHeaders.indexOf(csvHeader);
        if (colIndex === -1) continue;

        const colConfig = colConfigMap.get(fieldKey);
        if (!colConfig) continue;

        const rawValue = row[colIndex];
        const coerced = coerceValue(rawValue, colConfig);
        if (coerced !== undefined) {
          record[fieldKey] = coerced;
        }
      }

      return record;
    });
  }, [csvData, csvHeaders, mapping, config.columns]);

  const previewRows = useMemo(
    () => transformedData.slice(0, 10),
    [transformedData]
  );

  const previewColumns = useMemo(() => {
    const fields = Object.values(mapping);
    return config.columns.filter((col) => fields.includes(col.key));
  }, [mapping, config.columns]);

  const handleUploadAccepted = useCallback(
    (results: { data: string[][] }, file?: { name: string }) => {
      if (!results.data || results.data.length < 2) return;

      const headers = results.data[0];
      const rows = results.data.slice(1).filter((row) =>
        row.some((cell) => cell && cell.trim() !== "")
      );

      setCsvHeaders(headers);
      setCsvData(rows);
      setFileName(file?.name ?? "uploaded-file.csv");
      setMapping({});
      setState("MAPPING");
    },
    []
  );

  const handleConfirmMapping = useCallback(() => {
    setState("PREVIEW");
  }, []);

  const handleImport = useCallback(() => {
    setState("IMPORTING");
    onUpload(transformedData);
  }, [onUpload, transformedData]);

  const handleReset = useCallback(() => {
    setState("IDLE");
    setCsvData([]);
    setCsvHeaders([]);
    setMapping({});
    setFileName("");
  }, []);

  // When upload finishes (isLoading transitions from true to false while IMPORTING)
  const wasImporting = state === "IMPORTING" && !isLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5" />
            {config.entityName} Import
          </CardTitle>
          {currentCount !== undefined && currentCount > 0 && (
            <Badge variant="secondary">
              {currentCount.toLocaleString()} records
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* IDLE State - Upload Area */}
        {state === "IDLE" && (
          <CSVReader onUploadAccepted={handleUploadAccepted}>
            {({ getRootProps, acceptedFile, ProgressBar }: {
              getRootProps: () => Record<string, unknown>;
              acceptedFile: { name: string } | null;
              ProgressBar: React.ComponentType;
            }) => (
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-10 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CSV files only (.csv)
                    </p>
                  </div>
                </div>
                {currentCount !== undefined && (
                  <p className="text-center text-xs text-muted-foreground">
                    Currently {currentCount.toLocaleString()} {config.entityName.toLowerCase()} in the database
                  </p>
                )}
              </div>
            )}
          </CSVReader>
        )}

        {/* MAPPING State - Column Mapping */}
        {state === "MAPPING" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Mapping columns from: {fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {csvData.length.toLocaleString()} rows detected
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </div>

            <ColumnMapper
              csvHeaders={csvHeaders}
              entityColumns={config.columns}
              mapping={mapping}
              onMappingChange={setMapping}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmMapping}
                disabled={!allRequiredMapped}
              >
                {allRequiredMapped ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Preview Data
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-1 h-4 w-4" />
                    Map Required Fields
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* PREVIEW State - Data Preview */}
        {state === "PREVIEW" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Preview: {fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Showing first {Math.min(10, transformedData.length)} of{" "}
                  {transformedData.length.toLocaleString()} rows
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState("MAPPING")}
                >
                  Back to Mapping
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {previewColumns.map((col) => (
                      <TableHead key={col.key}>
                        {col.label}
                        {col.required && (
                          <span className="text-destructive ml-0.5">*</span>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      {previewColumns.map((col) => (
                        <TableCell key={col.key} className="font-mono text-xs">
                          {row[col.key] !== null && row[col.key] !== undefined
                            ? String(row[col.key])
                            : (
                              <span className="text-muted-foreground/50">
                                --
                              </span>
                            )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button onClick={handleImport}>
                <Upload className="mr-1 h-4 w-4" />
                Import {transformedData.length.toLocaleString()} Records
              </Button>
            </div>
          </div>
        )}

        {/* IMPORTING State - Loading */}
        {state === "IMPORTING" && !wasImporting && (
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <div className="text-center">
              <p className="text-sm font-medium">
                Importing {transformedData.length.toLocaleString()} records...
              </p>
              <p className="text-xs text-muted-foreground">
                This may take a moment for large datasets
              </p>
            </div>
          </div>
        )}

        {/* IMPORTING complete */}
        {wasImporting && (
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Import Complete</p>
              <p className="text-xs text-muted-foreground">
                {transformedData.length.toLocaleString()} records imported
                successfully
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Upload Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
