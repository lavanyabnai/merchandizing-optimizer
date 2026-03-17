"use client";

import { useMemo } from "react";
import { KPIGrid, type DashboardMetrics } from "./KPIGrid";
import { SalesTrendChart, type WeeklySalesData } from "./SalesTrendChart";
import { TopPerformersChart, type TopPerformerData } from "./TopPerformersChart";
import { CategoryMixChart, type CategoryMixData } from "./CategoryMixChart";
import { BrandTierChart, type BrandTierData } from "./BrandTierChart";
import { useGetProducts } from "@/features/assortment/api/use-get-products";
import { useGetSales, useGetDashboardMetrics } from "@/features/assortment/api/use-get-sales";
import { useAssortmentStore } from "@/features/assortment/store/use-assortment-store";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";
import type { BrandTier, Product, Sale } from "@/features/assortment/types";

// Demo data generator for development/preview
function generateDemoData() {
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  const subcategories = ["Cola", "Lemon-Lime", "Orange", "Root Beer", "Sparkling Water", "Energy"];
  const brandTiers: BrandTier[] = ["Premium", "National A", "National B", "Store Brand"];
  const brands = ["Coca-Cola", "Pepsi", "Sprite", "Fanta", "7-Up", "Store Brand"];

  // Weekly sales trend
  const weeklySales: WeeklySalesData[] = weeks.map((week) => {
    // Add seasonality - higher in summer (weeks 20-35)
    const seasonality = Math.sin((week - 10) * (Math.PI / 26)) * 0.3 + 1;
    const baseRevenue = 50000 + Math.random() * 10000;
    const revenue = baseRevenue * seasonality;
    const marginPct = 0.25 + Math.random() * 0.1;
    return {
      week,
      revenue: Math.round(revenue),
      profit: Math.round(revenue * marginPct),
      units: Math.round(revenue / (3.5 + Math.random())),
    };
  });

  // Top performers
  const topPerformers: TopPerformerData[] = Array.from({ length: 25 }, (_, i) => {
    const subcategory = subcategories[i % subcategories.length];
    const brand = brands[i % brands.length];
    const revenue = 50000 + Math.random() * 200000;
    const marginPct = 0.2 + Math.random() * 0.15;
    return {
      sku: `SKU-${String(i + 1).padStart(4, "0")}`,
      name: `${brand} ${subcategory} ${["12oz Can", "20oz Bottle", "2L Bottle", "6-Pack"][i % 4]}`,
      brand,
      subcategory,
      revenue: Math.round(revenue),
      profit: Math.round(revenue * marginPct),
      units: Math.round(revenue / (3.5 + Math.random() * 2)),
    };
  });

  // Category mix
  const totalRevenue = topPerformers.reduce((sum, p) => sum + p.revenue, 0);
  const categoryMix: CategoryMixData[] = subcategories.map((subcategory) => {
    const catRevenue = topPerformers
      .filter((p) => p.subcategory === subcategory)
      .reduce((sum, p) => sum + p.revenue, 0);
    return {
      subcategory,
      revenue: catRevenue,
      share: (catRevenue / totalRevenue) * 100,
    };
  });

  // Brand tier performance
  const brandTierData: BrandTierData[] = brandTiers.map((brandTier) => {
    const tierRevenue = 200000 + Math.random() * 300000;
    const marginPct = brandTier === "Store Brand" ? 35 + Math.random() * 5 : 20 + Math.random() * 10;
    return {
      brandTier,
      revenue: Math.round(tierRevenue),
      profit: Math.round(tierRevenue * (marginPct / 100)),
      units: Math.round(tierRevenue / (3.5 + Math.random() * 2)),
      marginPct,
    };
  });

  // KPI metrics
  const metrics: DashboardMetrics = {
    totalRevenue: weeklySales.reduce((sum, w) => sum + w.revenue, 0),
    totalProfit: weeklySales.reduce((sum, w) => sum + w.profit, 0),
    profitMargin: 28.5,
    gmroi: 2.85,
    skuCount: 248,
    inventoryTurns: 18.4,
    salesPerLinearFoot: 1250,
    linearFeet: 48,
    previousRevenue: weeklySales.reduce((sum, w) => sum + w.revenue, 0) * 0.92,
    previousProfit: weeklySales.reduce((sum, w) => sum + w.profit, 0) * 0.88,
    previousMargin: 26.2,
  };

  return { weeklySales, topPerformers, categoryMix, brandTierData, metrics };
}

// Transform API data to chart formats
function transformSalesToWeekly(sales: Sale[]): WeeklySalesData[] {
  const weeklyMap = new Map<number, WeeklySalesData>();

  for (const sale of sales) {
    const existing = weeklyMap.get(sale.weekNumber);
    if (existing) {
      existing.revenue += sale.revenue;
      existing.profit += sale.revenue * 0.28; // Estimate profit
      existing.units += sale.unitsSold;
    } else {
      weeklyMap.set(sale.weekNumber, {
        week: sale.weekNumber,
        revenue: sale.revenue,
        profit: sale.revenue * 0.28,
        units: sale.unitsSold,
      });
    }
  }

  return Array.from(weeklyMap.values()).sort((a, b) => a.week - b.week);
}

function transformProductsToPerformers(
  products: Product[],
  sales: Sale[]
): TopPerformerData[] {
  // Aggregate sales by product
  const salesByProduct = new Map<string, { revenue: number; profit: number; units: number }>();

  for (const sale of sales) {
    const existing = salesByProduct.get(sale.productId);
    const product = products.find((p) => p.id === sale.productId);
    const cost = product?.cost ?? 0;
    const profit = sale.revenue - sale.unitsSold * cost;

    if (existing) {
      existing.revenue += sale.revenue;
      existing.profit += profit;
      existing.units += sale.unitsSold;
    } else {
      salesByProduct.set(sale.productId, {
        revenue: sale.revenue,
        profit,
        units: sale.unitsSold,
      });
    }
  }

  return products
    .map((product) => {
      const salesData = salesByProduct.get(product.id) || { revenue: 0, profit: 0, units: 0 };
      return {
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        subcategory: product.subcategory,
        revenue: salesData.revenue,
        profit: salesData.profit,
        units: salesData.units,
      };
    })
    .filter((p) => p.revenue > 0);
}

function transformToCategoryMix(
  products: Product[],
  sales: Sale[]
): CategoryMixData[] {
  const revenueByCategory = new Map<string, number>();
  let totalRevenue = 0;

  for (const sale of sales) {
    const product = products.find((p) => p.id === sale.productId);
    if (product) {
      const current = revenueByCategory.get(product.subcategory) || 0;
      revenueByCategory.set(product.subcategory, current + sale.revenue);
      totalRevenue += sale.revenue;
    }
  }

  return Array.from(revenueByCategory.entries()).map(([subcategory, revenue]) => ({
    subcategory,
    revenue,
    share: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
  }));
}

function transformToBrandTier(
  products: Product[],
  sales: Sale[]
): BrandTierData[] {
  const tierData = new Map<BrandTier, { revenue: number; profit: number; units: number }>();

  for (const sale of sales) {
    const product = products.find((p) => p.id === sale.productId);
    if (product) {
      const tier = product.brandTier;
      const cost = product.cost;
      const profit = sale.revenue - sale.unitsSold * cost;

      const existing = tierData.get(tier);
      if (existing) {
        existing.revenue += sale.revenue;
        existing.profit += profit;
        existing.units += sale.unitsSold;
      } else {
        tierData.set(tier, {
          revenue: sale.revenue,
          profit,
          units: sale.unitsSold,
        });
      }
    }
  }

  return Array.from(tierData.entries()).map(([brandTier, data]) => ({
    brandTier,
    revenue: data.revenue,
    profit: data.profit,
    units: data.units,
    marginPct: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
  }));
}

interface DashboardProps {
  useDemoData?: boolean;
}

export function Dashboard({ useDemoData = true }: DashboardProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { selectedStore, selectedSubcategories } = useAssortmentStore();

  // Fetch real data (will be used when API is connected)
  const { data: productsData, isLoading: productsLoading } = useGetProducts({
    storeId: selectedStore ?? undefined,
    isActive: true,
    pageSize: 500,
  });

  const { data: salesData, isLoading: salesLoading } = useGetSales({
    storeId: selectedStore ?? undefined,
    pageSize: 10000,
  });

  const { data: metricsData, isLoading: metricsLoading } = useGetDashboardMetrics(
    selectedStore ?? undefined
  );

  const isLoading = productsLoading || salesLoading || metricsLoading;

  // Use demo data or transform real data
  const {
    weeklySales,
    topPerformers,
    categoryMix,
    brandTierData,
    metrics,
  } = useMemo(() => {
    if (useDemoData) {
      return generateDemoData();
    }

    const products = productsData?.items ?? [];
    const sales = salesData?.items ?? [];

    // Filter by selected subcategories if any
    const filteredProducts = selectedSubcategories.length > 0
      ? products.filter((p) => selectedSubcategories.includes(p.subcategory))
      : products;

    const productIds = new Set(filteredProducts.map((p) => p.id));
    const filteredSales = sales.filter((s) => productIds.has(s.productId));

    const weeklySales = transformSalesToWeekly(filteredSales);
    const topPerformers = transformProductsToPerformers(filteredProducts, filteredSales);
    const categoryMix = transformToCategoryMix(filteredProducts, filteredSales);
    const brandTierData = transformToBrandTier(filteredProducts, filteredSales);

    // Calculate metrics from data
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.revenue, 0);
    const totalUnits = filteredSales.reduce((sum, s) => sum + s.unitsSold, 0);
    const totalProfit = topPerformers.reduce((sum, p) => sum + p.profit, 0);

    const metrics: DashboardMetrics = metricsData
      ? {
          totalRevenue: metricsData.totalRevenue,
          totalProfit: metricsData.totalProfit,
          profitMargin: metricsData.avgMargin,
          gmroi: 2.5, // Would need inventory data
          skuCount: metricsData.skuCount,
          inventoryTurns: 18, // Would need inventory data
          salesPerLinearFoot: totalRevenue / 48, // Assume 48 linear feet
          linearFeet: 48,
        }
      : {
          totalRevenue,
          totalProfit,
          profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
          gmroi: 2.5,
          skuCount: filteredProducts.length,
          inventoryTurns: 18,
          salesPerLinearFoot: totalRevenue / 48,
          linearFeet: 48,
        };

    return { weeklySales, topPerformers, categoryMix, brandTierData, metrics };
  }, [useDemoData, productsData, salesData, metricsData, selectedSubcategories]);

  const totalRevenue = topPerformers.reduce((sum, p) => sum + p.revenue, 0);
  const totalProfit = topPerformers.reduce((sum, p) => sum + p.profit, 0);
  const totalUnits = topPerformers.reduce((sum, p) => sum + p.units, 0);

  return (
    <div className="space-y-6">
      {/* About Section */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={() => setIsAboutOpen(!isAboutOpen)}
        >
          <Info className="h-4 w-4" />
          About this Dashboard
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isAboutOpen ? "rotate-180" : ""}`}
          />
        </Button>
        {isAboutOpen && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">What this shows:</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                <strong>Financial Performance:</strong> Revenue, profit, and margins
              </li>
              <li>
                <strong>Space Productivity:</strong> How efficiently shelf space generates sales
              </li>
              <li>
                <strong>Inventory Efficiency:</strong> GMROI and turnover rates
              </li>
              <li>
                <strong>Assortment Health:</strong> SKU count and concentration
              </li>
            </ul>
            <p className="font-medium text-foreground mb-2">How to use it:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Compare metrics across stores using the store selector</li>
              <li>Identify seasonal patterns in the trend chart</li>
              <li>Find your hero SKUs and underperformers</li>
              <li>Understand category and brand mix dynamics</li>
            </ul>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <KPIGrid metrics={metrics} isLoading={isLoading && !useDemoData} />

      <Separator />

      {/* Sales Trend and Category Mix */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesTrendChart data={weeklySales} isLoading={isLoading && !useDemoData} />
        </div>
        <div>
          <CategoryMixChart data={categoryMix} isLoading={isLoading && !useDemoData} />
        </div>
      </div>

      <Separator />

      {/* Top SKUs and Brand Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopPerformersChart
          data={topPerformers}
          isLoading={isLoading && !useDemoData}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
        <BrandTierChart data={brandTierData} isLoading={isLoading && !useDemoData} />
      </div>
    </div>
  );
}
