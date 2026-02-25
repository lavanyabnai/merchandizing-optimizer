"use client";

import { useMemo, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, DollarSign, TrendingUp } from "lucide-react";

interface DistributionChartProps {
  data: number[];
  p5: number;
  p50: number;
  p95: number;
  mean: number;
  baseline?: number;
  title: string;
  color: string;
  isLoading?: boolean;
}

// Create histogram bins
function createHistogramData(data: number[], numBins: number = 30) {
  if (data.length === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / numBins;

  const bins: { value: number; count: number; range: string }[] = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = data.filter((v) => v >= binStart && (i === numBins - 1 ? v <= binEnd : v < binEnd)).length;

    bins.push({
      value: binStart + binWidth / 2,
      count,
      range: `$${binStart.toLocaleString(undefined, { maximumFractionDigits: 0 })} - $${binEnd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    });
  }

  return bins;
}

// Format currency for axis
function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function DistributionChart({
  data,
  p5,
  p50,
  p95,
  mean: _mean,
  baseline,
  title,
  color,
  isLoading,
}: DistributionChartProps) {
  void _mean; // Mean is shown in reference lines, reserved for future label
  const histogramData = useMemo(() => createHistogramData(data, 30), [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const bin = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <p className="text-xs font-medium">{bin.range}</p>
        <p className="text-xs text-muted-foreground">
          {bin.count} trials ({((bin.count / data.length) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Distribution of outcomes across all simulation trials.
                  Vertical lines show key percentiles (5th, median, 95th).
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={histogramData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="value"
              tickFormatter={formatCurrency}
              tick={{ fontSize: 10 }}
              stroke="#9ca3af"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 5th percentile */}
            <ReferenceLine
              x={p5}
              stroke="#EF4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "5th",
                position: "top",
                fill: "#EF4444",
                fontSize: 10,
              }}
            />

            {/* Median */}
            <ReferenceLine
              x={p50}
              stroke="#22C55E"
              strokeWidth={2}
              label={{
                value: "Median",
                position: "top",
                fill: "#22C55E",
                fontSize: 10,
              }}
            />

            {/* 95th percentile */}
            <ReferenceLine
              x={p95}
              stroke="#EF4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "95th",
                position: "top",
                fill: "#EF4444",
                fontSize: 10,
              }}
            />

            {/* Baseline (if provided) */}
            {baseline && (
              <ReferenceLine
                x={baseline}
                stroke="#6B7280"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: "Baseline",
                  position: "insideTopRight",
                  fill: "#6B7280",
                  fontSize: 10,
                }}
              />
            )}

            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {histogramData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={color}
                  opacity={entry.value >= p5 && entry.value <= p95 ? 0.8 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-red-500" style={{ backgroundImage: "linear-gradient(90deg, transparent 50%, #EF4444 50%)", backgroundSize: "6px 100%" }} />
            <span className="text-xs text-muted-foreground">5th/95th %ile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-green-500" />
            <span className="text-xs text-muted-foreground">Median</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color, opacity: 0.8 }} />
            <span className="text-xs text-muted-foreground">90% CI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Combined dual chart for revenue and profit
interface DualDistributionChartProps {
  revenueData: number[];
  profitData: number[];
  revenueP5: number;
  revenueP50: number;
  revenueP95: number;
  profitP5: number;
  profitP50: number;
  profitP95: number;
  baselineRevenue?: number;
  baselineProfit?: number;
  isLoading?: boolean;
}

export function DualDistributionChart({
  revenueData,
  profitData,
  revenueP5,
  revenueP50,
  revenueP95,
  profitP5,
  profitP50,
  profitP95,
  baselineRevenue,
  baselineProfit,
  isLoading,
}: DualDistributionChartProps) {
  const [activeMetric, setActiveMetric] = useState<"revenue" | "profit">("profit");

  const data = activeMetric === "revenue" ? revenueData : profitData;
  const p5 = activeMetric === "revenue" ? revenueP5 : profitP5;
  const p50 = activeMetric === "revenue" ? revenueP50 : profitP50;
  const p95 = activeMetric === "revenue" ? revenueP95 : profitP95;
  const baseline = activeMetric === "revenue" ? baselineRevenue : baselineProfit;
  const color = activeMetric === "revenue" ? "#2E86AB" : "#28A745";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">
              Outcome Distribution
            </CardTitle>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">
                    Histogram showing the distribution of outcomes across all
                    simulation trials. The shaded region represents the 90%
                    confidence interval.
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-1">
            <Button
              variant={activeMetric === "revenue" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric("revenue")}
              className="h-7 text-xs"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Revenue
            </Button>
            <Button
              variant={activeMetric === "profit" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric("profit")}
              className="h-7 text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Profit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DistributionChart
          data={data}
          p5={p5}
          p50={p50}
          p95={p95}
          mean={(p5 + p95) / 2}
          baseline={baseline}
          title=""
          color={color}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
