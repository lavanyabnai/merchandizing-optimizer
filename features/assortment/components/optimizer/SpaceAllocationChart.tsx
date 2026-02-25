"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpaceAllocation } from "@/features/assortment/types";

interface SpaceAllocationChartProps {
  data: SpaceAllocation[];
  isLoading?: boolean;
}

// Color palette for subcategories
const SUBCATEGORY_COLORS: Record<string, string> = {
  Cola: "#2E86AB",
  "Lemon-Lime": "#28A745",
  Orange: "#FF8C00",
  "Root Beer": "#8B4513",
  "Sparkling Water": "#00CED1",
  Energy: "#DC143C",
  Juice: "#9333EA",
  Water: "#3B82F6",
  "Sports Drinks": "#F59E0B",
  Tea: "#84CC16",
  Default: "#6B7280",
};

function getSubcategoryColor(subcategory: string): string {
  return SUBCATEGORY_COLORS[subcategory] || SUBCATEGORY_COLORS.Default;
}

interface ChartDataItem {
  subcategory: string;
  current: number;
  optimized: number;
  change: number;
  currentPct: number;
  optimizedPct: number;
  color: string;
}

export function SpaceAllocationChart({ data, isLoading }: SpaceAllocationChartProps) {
  // Transform data for chart
  const chartData: ChartDataItem[] = useMemo(() => {
    return data.map((item) => ({
      subcategory: item.subcategory,
      current: item.currentFacings,
      optimized: item.optimizedFacings,
      change: item.change,
      currentPct: item.currentPct,
      optimizedPct: item.optimizedPct,
      color: getSubcategoryColor(item.subcategory),
    })).sort((a, b) => b.optimized - a.optimized);
  }, [data]);

  // Calculate insights
  const insights = useMemo(() => {
    if (chartData.length === 0) return null;

    const maxGain = chartData.reduce((max, item) =>
      item.change > max.change ? item : max
    , chartData[0]);

    const maxLoss = chartData.reduce((min, item) =>
      item.change < min.change ? item : min
    , chartData[0]);

    const totalCurrent = chartData.reduce((sum, item) => sum + item.current, 0);
    const totalOptimized = chartData.reduce((sum, item) => sum + item.optimized, 0);

    return {
      maxGain,
      maxLoss,
      totalCurrent,
      totalOptimized,
      netChange: totalOptimized - totalCurrent,
    };
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const item = chartData.find((d) => d.subcategory === label);
    if (!item) return null;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-medium text-sm mb-2">{label}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Current:</span>
            <span className="font-medium">{item.current} facings ({item.currentPct.toFixed(1)}%)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Optimized:</span>
            <span className="font-medium">{item.optimized} facings ({item.optimizedPct.toFixed(1)}%)</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t">
            <span className="text-muted-foreground">Change:</span>
            <span className={cn(
              "font-medium",
              item.change > 0 ? "text-green-600" : item.change < 0 ? "text-red-600" : ""
            )}>
              {item.change > 0 ? "+" : ""}{item.change} facings
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Space Allocation by Subcategory
          </CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Compares how shelf space is allocated across subcategories
                  before and after optimization. Changes reflect profit potential.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No space allocation data available
          </div>
        ) : (
          <>
            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="subcategory"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  label={{
                    value: "Facings",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "#6b7280" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="rect"
                  iconSize={10}
                />
                <Bar
                  dataKey="current"
                  name="Current"
                  fill="#9CA3AF"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="optimized"
                  name="Optimized"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Change indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {chartData.slice(0, 4).map((item) => (
                <div
                  key={item.subcategory}
                  className={cn(
                    "rounded-lg border p-2 text-center",
                    item.change > 0
                      ? "border-green-200 bg-green-50"
                      : item.change < 0
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  )}
                >
                  <p className="text-xs text-muted-foreground truncate">
                    {item.subcategory}
                  </p>
                  <p className={cn(
                    "text-sm font-bold flex items-center justify-center gap-1",
                    item.change > 0
                      ? "text-green-600"
                      : item.change < 0
                      ? "text-red-600"
                      : "text-muted-foreground"
                  )}>
                    {item.change > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : item.change < 0 ? (
                      <TrendingDown className="h-3.5 w-3.5" />
                    ) : null}
                    {item.change > 0 ? "+" : ""}{item.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Insight */}
            {insights && (insights.maxGain.change > 0 || insights.maxLoss.change < 0) && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Reallocation Insight:</strong>
                  {insights.maxGain.change > 0 && (
                    <>
                      {" "}<strong>{insights.maxGain.subcategory}</strong> gains the most space
                      (+{insights.maxGain.change} facings) — likely higher profit potential.
                    </>
                  )}
                  {insights.maxLoss.change < 0 && (
                    <>
                      {" "}<strong>{insights.maxLoss.subcategory}</strong> loses space
                      ({insights.maxLoss.change} facings) — may be over-spaced relative to performance.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
