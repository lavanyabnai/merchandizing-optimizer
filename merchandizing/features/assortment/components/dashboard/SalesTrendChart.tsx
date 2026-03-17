"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export interface WeeklySalesData {
  week: number;
  revenue: number;
  profit: number;
  units: number;
}

interface SalesTrendChartProps {
  data: WeeklySalesData[];
  isLoading?: boolean;
}

type MetricType = "revenue" | "profit" | "units";

const METRIC_CONFIG: Record<MetricType, { label: string; color: string; format: (v: number) => string }> = {
  revenue: {
    label: "Revenue",
    color: "#2E86AB",
    format: (v) => `$${(v / 1000).toFixed(0)}K`,
  },
  profit: {
    label: "Profit",
    color: "#28A745",
    format: (v) => `$${(v / 1000).toFixed(0)}K`,
  },
  units: {
    label: "Units",
    color: "#6366F1",
    format: (v) => v.toLocaleString(),
  },
};

function calculateInsights(data: WeeklySalesData[]) {
  if (!data.length) return null;

  const revenues = data.map((d) => d.revenue);
  const peakWeek = data[revenues.indexOf(Math.max(...revenues))].week;
  const lowWeek = data[revenues.indexOf(Math.min(...revenues))].week;
  const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
  const seasonality = ((Math.max(...revenues) - Math.min(...revenues)) / mean) * 100;

  return { peakWeek, lowWeek, seasonality };
}

export function SalesTrendChart({ data, isLoading }: SalesTrendChartProps) {
  const [metric, setMetric] = useState<MetricType>("revenue");

  const insights = calculateInsights(data);
  const config = METRIC_CONFIG[metric];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Weekly Sales Trend</CardTitle>
        <Select value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="profit">Profit</SelectItem>
            <SelectItem value="units">Units</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No sales data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `W${v}`}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={config.format}
                  stroke="#9ca3af"
                  width={60}
                />
                <Tooltip
                  formatter={(value: number) => [config.format(value), config.label]}
                  labelFormatter={(label) => `Week ${label}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={config.color}
                  strokeWidth={2}
                  fill={`url(#gradient-${metric})`}
                />
              </AreaChart>
            </ResponsiveContainer>

            {insights && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Trend Insights:</strong> Peak sales in{" "}
                  <strong>Week {insights.peakWeek}</strong>, lowest in{" "}
                  <strong>Week {insights.lowWeek}</strong>. Seasonality index:{" "}
                  <strong>{insights.seasonality.toFixed(0)}%</strong> variation from mean.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
