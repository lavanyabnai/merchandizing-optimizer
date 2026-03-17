"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SwitchingMatrixData {
  from: string;
  to: string;
  probability: number;
}

interface SwitchingMatrixProps {
  brandData: SwitchingMatrixData[];
  subcategoryData: SwitchingMatrixData[];
  isLoading?: boolean;
}

type ViewLevel = "brand" | "subcategory";

// Generate color based on probability (blue scale)
function getHeatmapColor(value: number): string {
  // Scale from light (low) to dark blue (high)
  if (value >= 0.8) return "#1e40af"; // Very high
  if (value >= 0.6) return "#2563eb"; // High
  if (value >= 0.4) return "#3b82f6"; // Medium-high
  if (value >= 0.3) return "#60a5fa"; // Medium
  if (value >= 0.2) return "#93c5fd"; // Low-medium
  if (value >= 0.1) return "#bfdbfe"; // Low
  return "#dbeafe"; // Very low
}

function getTextColor(value: number): string {
  return value >= 0.5 ? "#ffffff" : "#1f2937";
}

// Build matrix from flat data
function buildMatrix(data: SwitchingMatrixData[]): {
  labels: string[];
  matrix: number[][];
} {
  const labelsSet = new Set<string>();
  data.forEach((d) => {
    labelsSet.add(d.from);
    labelsSet.add(d.to);
  });
  const labels = Array.from(labelsSet).sort();

  const matrix: number[][] = labels.map(() => labels.map(() => 0));

  data.forEach((d) => {
    const fromIdx = labels.indexOf(d.from);
    const toIdx = labels.indexOf(d.to);
    if (fromIdx >= 0 && toIdx >= 0) {
      matrix[fromIdx][toIdx] = d.probability;
    }
  });

  // Set diagonal to 1 (same item/brand = 100%)
  labels.forEach((_, i) => {
    matrix[i][i] = 1;
  });

  return { labels, matrix };
}

export function SwitchingMatrix({
  brandData,
  subcategoryData,
  isLoading,
}: SwitchingMatrixProps) {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("brand");

  const { labels, matrix } = useMemo(() => {
    const data = viewLevel === "brand" ? brandData : subcategoryData;
    return buildMatrix(data);
  }, [viewLevel, brandData, subcategoryData]);

  // Calculate insights
  const insights = useMemo(() => {
    if (labels.length === 0) return null;

    let maxOffDiagonal = 0;
    let maxPair = { from: "", to: "" };

    for (let i = 0; i < labels.length; i++) {
      for (let j = 0; j < labels.length; j++) {
        if (i !== j && matrix[i][j] > maxOffDiagonal) {
          maxOffDiagonal = matrix[i][j];
          maxPair = { from: labels[i], to: labels[j] };
        }
      }
    }

    // Calculate average off-diagonal
    let sum = 0;
    let count = 0;
    for (let i = 0; i < labels.length; i++) {
      for (let j = 0; j < labels.length; j++) {
        if (i !== j) {
          sum += matrix[i][j];
          count++;
        }
      }
    }
    const avgSwitching = count > 0 ? sum / count : 0;

    return { maxPair, maxOffDiagonal, avgSwitching };
  }, [labels, matrix]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">
              Substitution Affinity Matrix
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">
                    Shows the probability that a customer will switch from one
                    {viewLevel === "brand" ? " brand" : " subcategory"} to another when their
                    preferred item is unavailable. Higher values (darker) indicate stronger
                    substitution patterns.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={viewLevel} onValueChange={(v) => setViewLevel(v as ViewLevel)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brand">By Brand</SelectItem>
              <SelectItem value="subcategory">By Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {labels.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No switching data available
          </div>
        ) : (
          <>
            {/* Heatmap */}
            <div className="overflow-x-auto">
              <div className="min-w-fit">
                {/* Header row */}
                <div className="flex">
                  <div className="w-24 shrink-0" /> {/* Empty corner */}
                  {labels.map((label) => (
                    <div
                      key={`header-${label}`}
                      className="w-16 shrink-0 text-center text-xs font-medium text-muted-foreground p-1 truncate"
                      title={label}
                    >
                      {label.length > 8 ? `${label.slice(0, 8)}...` : label}
                    </div>
                  ))}
                </div>

                {/* Data rows */}
                {labels.map((rowLabel, rowIdx) => (
                  <div key={`row-${rowLabel}`} className="flex">
                    <div className="w-24 shrink-0 text-xs font-medium text-muted-foreground p-1 flex items-center truncate" title={rowLabel}>
                      {rowLabel.length > 12 ? `${rowLabel.slice(0, 12)}...` : rowLabel}
                    </div>
                    {labels.map((colLabel, colIdx) => {
                      const value = matrix[rowIdx][colIdx];
                      const isDiagonal = rowIdx === colIdx;

                      return (
                        <TooltipProvider key={`cell-${rowIdx}-${colIdx}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "w-16 h-10 shrink-0 flex items-center justify-center text-xs font-medium border border-white/20 transition-transform hover:scale-105 cursor-default",
                                  isDiagonal && "opacity-50"
                                )}
                                style={{
                                  backgroundColor: getHeatmapColor(value),
                                  color: getTextColor(value),
                                }}
                              >
                                {(value * 100).toFixed(0)}%
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {isDiagonal
                                  ? `${rowLabel} (same item)`
                                  : `${(value * 100).toFixed(0)}% of ${rowLabel} customers will switch to ${colLabel}`}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="flex h-3">
                {[0.05, 0.15, 0.25, 0.35, 0.5, 0.7, 0.9].map((v) => (
                  <div
                    key={v}
                    className="w-6 h-full"
                    style={{ backgroundColor: getHeatmapColor(v) }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>

            {/* Insights */}
            {insights && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Switching Insight:</strong> Highest substitution is from{" "}
                  <strong>{insights.maxPair.from}</strong> to{" "}
                  <strong>{insights.maxPair.to}</strong> at{" "}
                  <strong>{(insights.maxOffDiagonal * 100).toFixed(0)}%</strong>.
                  Average cross-{viewLevel} switching rate: {(insights.avgSwitching * 100).toFixed(0)}%.
                  {viewLevel === "brand" && " Store brands and value tiers typically show higher affinity."}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
