"use client";

import { useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from "./upload-configs";

interface ColumnMapperProps {
  csvHeaders: string[];
  entityColumns: ColumnConfig[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
}

/**
 * Normalize a string for fuzzy matching by lowering case and
 * stripping underscores, hyphens, and spaces.
 */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[_\-\s]/g, "");
}

/**
 * Attempt to auto-detect mapping between CSV headers and entity columns.
 * Uses case-insensitive, separator-insensitive matching.
 */
function autoDetectMapping(
  csvHeaders: string[],
  entityColumns: ColumnConfig[]
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedFields = new Set<string>();

  for (const header of csvHeaders) {
    const normalizedHeader = normalize(header);

    for (const col of entityColumns) {
      if (usedFields.has(col.key)) continue;

      const normalizedKey = normalize(col.key);
      const normalizedLabel = normalize(col.label);

      if (
        normalizedHeader === normalizedKey ||
        normalizedHeader === normalizedLabel
      ) {
        mapping[header] = col.key;
        usedFields.add(col.key);
        break;
      }
    }
  }

  return mapping;
}

export function ColumnMapper({
  csvHeaders,
  entityColumns,
  mapping,
  onMappingChange,
}: ColumnMapperProps) {
  // Run auto-detection on mount if mapping is empty
  useEffect(() => {
    if (Object.keys(mapping).length === 0 && csvHeaders.length > 0) {
      const detected = autoDetectMapping(csvHeaders, entityColumns);
      if (Object.keys(detected).length > 0) {
        onMappingChange(detected);
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requiredFields = useMemo(
    () => entityColumns.filter((col) => col.required),
    [entityColumns]
  );

  const mappedFields = useMemo(
    () => new Set(Object.values(mapping)),
    [mapping]
  );

  const unmappedRequired = useMemo(
    () => requiredFields.filter((col) => !mappedFields.has(col.key)),
    [requiredFields, mappedFields]
  );

  const handleMappingChange = (csvHeader: string, fieldKey: string) => {
    const newMapping = { ...mapping };

    if (fieldKey === "__unmapped__") {
      delete newMapping[csvHeader];
    } else {
      // Remove any existing mapping to this field from other headers
      for (const [key, value] of Object.entries(newMapping)) {
        if (value === fieldKey && key !== csvHeader) {
          delete newMapping[key];
        }
      }
      newMapping[csvHeader] = fieldKey;
    }

    onMappingChange(newMapping);
  };

  return (
    <div className="space-y-4">
      {unmappedRequired.length > 0 && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm font-medium text-destructive">
            Required fields not yet mapped:
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {unmappedRequired.map((col) => (
              <Badge key={col.key} variant="destructive">
                {col.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">CSV Column</TableHead>
              <TableHead className="w-[60%]">Map to Field</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {csvHeaders.map((header) => (
              <TableRow key={header}>
                <TableCell className="font-mono text-sm">{header}</TableCell>
                <TableCell>
                  <Select
                    value={mapping[header] ?? "__unmapped__"}
                    onValueChange={(value) =>
                      handleMappingChange(header, value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Skip this column --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__unmapped__">
                        -- Skip this column --
                      </SelectItem>
                      {entityColumns.map((col) => {
                        const isMappedElsewhere =
                          mappedFields.has(col.key) &&
                          mapping[header] !== col.key;
                        return (
                          <SelectItem
                            key={col.key}
                            value={col.key}
                            disabled={isMappedElsewhere}
                          >
                            {col.label}
                            {col.required ? " *" : ""}
                            {col.type && col.type !== "string"
                              ? ` (${col.type})`
                              : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>* Required field</span>
        <span className="text-muted-foreground/50">|</span>
        <span>
          {Object.keys(mapping).length} of {csvHeaders.length} columns mapped
        </span>
        <span className="text-muted-foreground/50">|</span>
        <span>
          {requiredFields.length - unmappedRequired.length} of{" "}
          {requiredFields.length} required fields mapped
        </span>
      </div>
    </div>
  );
}
