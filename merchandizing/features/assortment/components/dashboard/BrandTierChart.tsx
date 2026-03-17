"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { BrandTier } from "@/features/assortment/types";

export interface BrandTierData {
  brandTier: BrandTier;
  revenue: number;
  profit: number;
  units: number;
  marginPct: number;
}

interface BrandTierChartProps {
  data: BrandTierData[];
  isLoading?: boolean;
}

// Brand tier order and colors
const BRAND_TIER_ORDER: BrandTier[] = ["Premium", "National A", "National B", "Store Brand"];

const COLORS = {
  revenue: "#2E86AB",
  profit: "#28A745",
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function BrandTierChart({ data, isLoading }: BrandTierChartProps) {
  // Sort data by brand tier order
  const sortedData = [...data].sort(
    (a, b) => BRAND_TIER_ORDER.indexOf(a.brandTier) - BRAND_TIER_ORDER.indexOf(b.brandTier)
  );

  // Calculate insights
  const storeBrand = sortedData.find((d) => d.brandTier === "Store Brand");
  const nationalA = sortedData.find((d) => d.brandTier === "National A");
  const sbMargin = storeBrand?.marginPct ?? 0;
  const naMargin = nationalA?.marginPct ?? 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Performance by Brand Tier</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No brand tier data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={sortedData}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="brandTier"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatCurrency}
                  stroke="#9ca3af"
                  width={60}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="top"
                  iconType="rect"
                  iconSize={12}
                  formatter={(value) => (
                    <span className="text-xs capitalize">{value}</span>
                  )}
                />
                <Bar
                  dataKey="revenue"
                  name="revenue"
                  fill={COLORS.revenue}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
                <Bar
                  dataKey="profit"
                  name="profit"
                  fill={COLORS.profit}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Margin comparison table */}
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {sortedData.map((tier) => (
                <div key={tier.brandTier} className="rounded-lg bg-muted/50 p-2">
                  <div className="text-xs text-muted-foreground">{tier.brandTier}</div>
                  <div className="text-sm font-semibold">{tier.marginPct.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">margin</div>
                </div>
              ))}
            </div>

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Brand Tier Insight:</strong> Store Brand margin:{" "}
                <strong>{sbMargin.toFixed(1)}%</strong> vs National A:{" "}
                <strong>{naMargin.toFixed(1)}%</strong>.{" "}
                Store brands typically offer higher margins but lower velocity. Balance national
                brands (traffic drivers) with private label (margin builders).
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}
