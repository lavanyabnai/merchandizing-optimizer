"use client";

import {
  DollarSign,
  TrendingUp,
  Percent,
  BarChart3,
  Package,
  RefreshCw,
  Ruler,
  Target,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "./KPICard";

// Tooltip definitions for KPIs
const KPI_TOOLTIPS = {
  revenue:
    "Total sales revenue across all products. Higher is better - indicates strong category performance.",
  profit:
    "Gross profit after cost of goods. The margin percentage shows profitability efficiency.",
  margin:
    "Profit margin as a percentage of revenue. Higher margins indicate better profitability.",
  gmroi:
    "Gross Margin Return on Inventory Investment. Values >2.0 are good; >3.0 is excellent. Shows how efficiently inventory generates profit.",
  skuCount:
    "Number of active SKUs in the assortment. Balance breadth (customer choice) vs. complexity (inventory costs).",
  salesPerLf:
    "Revenue generated per linear foot of shelf space. Higher values indicate better space productivity.",
  turns:
    "How many times inventory sells and replenishes annually. FMCG beverages typically target 12-24 turns.",
  linearFeet:
    "Total shelf space allocated to this category. Optimize to balance sales potential vs. store constraints.",
};

export interface DashboardMetrics {
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  gmroi: number;
  skuCount: number;
  inventoryTurns: number;
  salesPerLinearFoot: number;
  linearFeet: number;
  // Previous period values for comparison (optional)
  previousRevenue?: number;
  previousProfit?: number;
  previousMargin?: number;
}

interface KPIGridProps {
  metrics: DashboardMetrics | null;
  isLoading?: boolean;
}

export function KPIGrid({ metrics, isLoading }: KPIGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-4 text-center text-muted-foreground"
          >
            No data available
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Row 1 */}
      <KPICard
        title="Total Revenue"
        value={metrics.totalRevenue}
        previousValue={metrics.previousRevenue}
        format="currency"
        icon={<DollarSign className="h-5 w-5" />}
        tooltip={KPI_TOOLTIPS.revenue}
      />
      <KPICard
        title="Total Profit"
        value={metrics.totalProfit}
        previousValue={metrics.previousProfit}
        format="currency"
        icon={<TrendingUp className="h-5 w-5" />}
        tooltip={KPI_TOOLTIPS.profit}
      />
      <KPICard
        title="Profit Margin"
        value={metrics.profitMargin}
        previousValue={metrics.previousMargin}
        format="percent"
        icon={<Percent className="h-5 w-5" />}
        tooltip={KPI_TOOLTIPS.margin}
      />
      <KPICard
        title="GMROI"
        value={metrics.gmroi}
        format="decimal"
        icon={<BarChart3 className="h-5 w-5" />}
        tooltip={KPI_TOOLTIPS.gmroi}
      />

      {/* Row 2 */}
      <KPICard
        title="Active SKUs"
        value={metrics.skuCount}
        format="number"
        icon={<Package className="h-5 w-5" />}
        tooltip={KPI_TOOLTIPS.skuCount}
      />
      <KPICard
        title="Inventory Turns"
        value={metrics.inventoryTurns}
        format="decimal"
        icon={<RefreshCw className="h-5 w-5" />}
        tooltip={KPI_TOOLTIPS.turns}
      />
      <KPICard
        title="Sales/Linear Foot"
        value={metrics.salesPerLinearFoot}
        format="currency"
        icon={<Target className="h-5 w-5" />}
        tooltip={KPI_TOOLTIPS.salesPerLf}
      />
      <KPICard
        title="Linear Feet"
        value={metrics.linearFeet}
        format="number"
        suffix="ft"
        icon={<Ruler className="h-5 w-5" />}
        tooltip={KPI_TOOLTIPS.linearFeet}
      />
    </div>
  );
}
