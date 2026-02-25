"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
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

export interface TopPerformerData {
  sku: string;
  name: string;
  brand: string;
  subcategory: string;
  revenue: number;
  profit: number;
  units: number;
}

interface TopPerformersChartProps {
  data: TopPerformerData[];
  isLoading?: boolean;
  totalRevenue?: number;
  totalProfit?: number;
  totalUnits?: number;
}

type MetricType = "revenue" | "profit" | "units";

// Color palette for subcategories
const SUBCATEGORY_COLORS: Record<string, string> = {
  Cola: "#2E86AB",
  "Lemon-Lime": "#28A745",
  Orange: "#FF8C00",
  "Root Beer": "#8B4513",
  "Sparkling Water": "#00CED1",
  Energy: "#DC143C",
  Default: "#6366F1",
};

function getSubcategoryColor(subcategory: string): string {
  return SUBCATEGORY_COLORS[subcategory] || SUBCATEGORY_COLORS.Default;
}

function formatValue(value: number, metric: MetricType): string {
  if (metric === "units") {
    return value.toLocaleString();
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function truncateName(name: string, maxLength: number = 25): string {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
}

export function TopPerformersChart({
  data,
  isLoading,
  totalRevenue = 0,
  totalProfit = 0,
  totalUnits = 0,
}: TopPerformersChartProps) {
  const [metric, setMetric] = useState<MetricType>("revenue");

  // Sort and take top 10
  const sortedData = [...data]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 10)
    .map((item) => ({
      ...item,
      displayName: truncateName(item.name),
    }))
    .reverse(); // Reverse for horizontal bar chart (highest at top)

  // Calculate top 10 concentration
  const top10Total = sortedData.reduce((sum, item) => sum + item[metric], 0);
  const total = metric === "revenue" ? totalRevenue : metric === "profit" ? totalProfit : totalUnits;
  const concentration = total > 0 ? (top10Total / total) * 100 : 0;

  // Find dominant brand
  const brandCounts = sortedData.reduce((acc, item) => {
    acc[item.brand] = (acc[item.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dominantBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">
          Top 10 SKUs by {metric.charAt(0).toUpperCase() + metric.slice(1)}
        </CardTitle>
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
        {sortedData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No product data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => formatValue(v, metric)}
                  stroke="#9ca3af"
                />
                <YAxis
                  type="category"
                  dataKey="displayName"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  width={120}
                />
                <Tooltip
                  formatter={(value: number) => [formatValue(value, metric), metric.charAt(0).toUpperCase() + metric.slice(1)]}
                  labelFormatter={(_, payload) => {
                    if (payload && payload[0]) {
                      const item = payload[0].payload as TopPerformerData;
                      return `${item.name} (${item.brand})`;
                    }
                    return "";
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey={metric} radius={[0, 4, 4, 0]}>
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSubcategoryColor(entry.subcategory)} />
                  ))}
                  <LabelList
                    dataKey={metric}
                    position="right"
                    formatter={(value: number) => formatValue(value, metric)}
                    style={{ fontSize: 10, fill: "#6b7280" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend for subcategories */}
            <div className="mt-2 flex flex-wrap gap-3 justify-center">
              {Array.from(new Set(sortedData.map((d) => d.subcategory))).map((subcategory) => (
                <div key={subcategory} className="flex items-center gap-1.5">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: getSubcategoryColor(subcategory) }}
                  />
                  <span className="text-xs text-muted-foreground">{subcategory}</span>
                </div>
              ))}
            </div>

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Top Performers Insight:</strong> Top 10 SKUs contribute{" "}
                <strong>{concentration.toFixed(1)}%</strong> of total {metric}.{" "}
                {concentration > 50
                  ? "High concentration - consider protecting these core items."
                  : "Healthy distribution across assortment."}{" "}
                Top brand: <strong>{dominantBrand}</strong>.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}
