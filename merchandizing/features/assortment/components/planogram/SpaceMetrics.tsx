"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ruler, Package, DollarSign, Layers, HelpCircle } from "lucide-react";
import type { ShelfProduct } from "./ShelfDisplay";

// Subcategory colors
const SUBCATEGORY_COLORS: Record<string, string> = {
  "Soft Drinks": "#3B82F6",
  "Juices": "#F97316",
  "Water": "#06B6D4",
  "Energy Drinks": "#22C55E",
};

interface SpaceMetricsProps {
  products: ShelfProduct[];
  shelfWidth: number;
  numShelves: number;
}

interface SubcategoryMetrics {
  subcategory: string;
  facings: number;
  products: number;
  revenue: number;
  linearInches: number;
  share: number;
}

export function SpaceMetrics({
  products,
  shelfWidth,
  numShelves,
}: SpaceMetricsProps) {
  const metrics = useMemo(() => {
    const totalCapacity = shelfWidth * numShelves;
    const usedWidth = products.reduce(
      (sum, p) => sum + p.widthInches * p.facings,
      0
    );
    const utilization = (usedWidth / totalCapacity) * 100;
    const totalProducts = products.length;
    const totalFacings = products.reduce((sum, p) => sum + p.facings, 0);
    const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const revenuePerFoot = totalRevenue / (usedWidth / 12);

    return {
      totalCapacity,
      usedWidth,
      utilization,
      totalProducts,
      totalFacings,
      totalRevenue,
      revenuePerFoot,
    };
  }, [products, shelfWidth, numShelves]);

  const subcategoryMetrics = useMemo(() => {
    const bySubcat: Record<string, SubcategoryMetrics> = {};

    products.forEach((p) => {
      if (!bySubcat[p.subcategory]) {
        bySubcat[p.subcategory] = {
          subcategory: p.subcategory,
          facings: 0,
          products: 0,
          revenue: 0,
          linearInches: 0,
          share: 0,
        };
      }
      bySubcat[p.subcategory].facings += p.facings;
      bySubcat[p.subcategory].products += 1;
      bySubcat[p.subcategory].revenue += p.revenue || 0;
      bySubcat[p.subcategory].linearInches += p.widthInches * p.facings;
    });

    const totalFacings = products.reduce((sum, p) => sum + p.facings, 0);

    return Object.values(bySubcat)
      .map((m) => ({
        ...m,
        share: (m.facings / totalFacings) * 100,
      }))
      .sort((a, b) => b.facings - a.facings);
  }, [products]);

  const getUtilizationColor = (util: number) => {
    if (util >= 85 && util <= 95) return "text-green-600";
    if (util >= 70 && util < 85) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Space Utilization Metrics
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          How efficiently shelf space is being used
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Utilization */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ruler className="h-3.5 w-3.5" />
                    Utilization
                    <HelpCircle className="h-3 w-3" />
                  </div>
                  <p
                    className={`text-xl font-bold ${getUtilizationColor(
                      metrics.utilization
                    )}`}
                  >
                    {metrics.utilization.toFixed(1)}%
                  </p>
                  <Progress value={metrics.utilization} className="h-2" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  % of available shelf space currently used. Target 85-95% for
                  optimal balance.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Products */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    Products
                  </div>
                  <p className="text-xl font-bold">{metrics.totalProducts}</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.totalFacings} facings
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Unique products (SKUs) on shelf and total facings
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Linear Feet */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    Linear Feet
                  </div>
                  <p className="text-xl font-bold">
                    {(metrics.usedWidth / 12).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    of {(metrics.totalCapacity / 12).toFixed(1)} available
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Total linear feet of shelf space used
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Revenue per Foot */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    Rev/Linear Ft
                  </div>
                  <p className="text-xl font-bold">
                    ${metrics.revenuePerFoot.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">weekly</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Weekly revenue generated per linear foot of shelf space
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Subcategory Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Breakdown by Subcategory</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Subcategory</TableHead>
                <TableHead className="text-xs text-right">Facings</TableHead>
                <TableHead className="text-xs text-right">SKUs</TableHead>
                <TableHead className="text-xs text-right">Share</TableHead>
                <TableHead className="text-xs text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategoryMetrics.map((m) => (
                <TableRow key={m.subcategory}>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            SUBCATEGORY_COLORS[m.subcategory] || "#6B7280",
                        }}
                      />
                      {m.subcategory}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-right font-medium">
                    {m.facings}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {m.products}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {m.share.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    ${m.revenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Insight */}
        {subcategoryMetrics.length > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Space Allocation Insight:</strong>{" "}
            <span className="font-medium text-foreground">
              {subcategoryMetrics[0].subcategory}
            </span>{" "}
            has the most shelf space ({subcategoryMetrics[0].share.toFixed(1)}%
            of facings). Ensure space allocation aligns with sales contribution
            for optimal productivity.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
