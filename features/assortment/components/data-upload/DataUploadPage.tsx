"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Package,
  Store,
  TrendingUp,
  GitBranch,
  DollarSign,
  Warehouse,
  Users,
  LayoutGrid,
} from "lucide-react";

import { useGetAssortmentProducts } from "@/features/assortment/api/use-get-assortment-products";
import { useGetAssortmentStores } from "@/features/assortment/api/use-get-assortment-stores";
import { useGetAssortmentSales } from "@/features/assortment/api/use-get-assortment-sales";
import { useGetAssortmentHierarchy } from "@/features/assortment/api/use-get-assortment-hierarchy";

import { useBulkCreateAssortmentProducts } from "@/features/assortment/api/use-bulk-create-assortment-products";
import { useBulkCreateAssortmentStores } from "@/features/assortment/api/use-bulk-create-assortment-stores";
import { useBulkCreateAssortmentSales } from "@/features/assortment/api/use-bulk-create-assortment-sales";
import { useBulkCreateAssortmentHierarchy } from "@/features/assortment/api/use-bulk-create-assortment-hierarchy";
import { useBulkCreateAssortmentPricing } from "@/features/assortment/api/use-bulk-create-assortment-pricing";
import { useBulkCreateAssortmentInventory } from "@/features/assortment/api/use-bulk-create-assortment-inventory";
import { useBulkCreateAssortmentCustomers } from "@/features/assortment/api/use-bulk-create-assortment-customers";
import { useBulkCreateAssortmentSpace } from "@/features/assortment/api/use-bulk-create-assortment-space";

import { AssortmentUpload } from "./AssortmentUpload";
import {
  PRODUCT_UPLOAD_CONFIG,
  STORE_UPLOAD_CONFIG,
  SALES_UPLOAD_CONFIG,
  HIERARCHY_UPLOAD_CONFIG,
  PRICING_UPLOAD_CONFIG,
  INVENTORY_UPLOAD_CONFIG,
  CUSTOMER_SEGMENT_UPLOAD_CONFIG,
  SPACE_UPLOAD_CONFIG,
} from "./upload-configs";

export function DataUploadPage() {
  // --- GET hooks for current counts ---
  const productsQuery = useGetAssortmentProducts();
  const storesQuery = useGetAssortmentStores();
  const salesQuery = useGetAssortmentSales();
  const hierarchyQuery = useGetAssortmentHierarchy();

  // --- Bulk create mutations ---
  const productsMutation = useBulkCreateAssortmentProducts();
  const storesMutation = useBulkCreateAssortmentStores();
  const salesMutation = useBulkCreateAssortmentSales();
  const hierarchyMutation = useBulkCreateAssortmentHierarchy();
  const pricingMutation = useBulkCreateAssortmentPricing();
  const inventoryMutation = useBulkCreateAssortmentInventory();
  const customersMutation = useBulkCreateAssortmentCustomers();
  const spaceMutation = useBulkCreateAssortmentSpace();

  // --- Derive counts ---
  const productsCount = Array.isArray(productsQuery.data)
    ? productsQuery.data.length
    : 0;
  const storesCount = Array.isArray(storesQuery.data)
    ? storesQuery.data.length
    : 0;
  const salesCount = Array.isArray(salesQuery.data)
    ? salesQuery.data.length
    : 0;
  const hierarchyCount = Array.isArray(hierarchyQuery.data)
    ? hierarchyQuery.data.length
    : 0;

  // --- Summary stats ---
  const summaryItems = [
    { label: "Products", count: productsCount, icon: Package },
    { label: "Stores", count: storesCount, icon: Store },
    { label: "Sales", count: salesCount, icon: TrendingUp },
    { label: "Hierarchy", count: hierarchyCount, icon: GitBranch },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5" />
            Data Upload Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-semibold">
                    {item.count.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for each entity type */}
      <Tabs defaultValue="products">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="products" className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Products
          </TabsTrigger>
          <TabsTrigger value="stores" className="gap-1.5">
            <Store className="h-3.5 w-3.5" />
            Stores
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-1.5">
            <Warehouse className="h-3.5 w-3.5" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Customer Segments
          </TabsTrigger>
          <TabsTrigger value="space" className="gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" />
            Space Allocation
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <AssortmentUpload
            config={PRODUCT_UPLOAD_CONFIG}
            onUpload={(data) => productsMutation.mutate(data as never)}
            isLoading={productsMutation.isPending}
            currentCount={productsCount}
          />
        </TabsContent>

        {/* Stores Tab */}
        <TabsContent value="stores">
          <AssortmentUpload
            config={STORE_UPLOAD_CONFIG}
            onUpload={(data) => storesMutation.mutate(data as never)}
            isLoading={storesMutation.isPending}
            currentCount={storesCount}
          />
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales">
          <div className="space-y-2">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Sales data is <strong>append-only</strong>. New records will be
                added to existing data rather than replacing it.
              </p>
            </div>
            <AssortmentUpload
              config={SALES_UPLOAD_CONFIG}
              onUpload={(data) => salesMutation.mutate(data as never)}
              isLoading={salesMutation.isPending}
              currentCount={salesCount}
            />
          </div>
        </TabsContent>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy">
          <AssortmentUpload
            config={HIERARCHY_UPLOAD_CONFIG}
            onUpload={(data) => hierarchyMutation.mutate(data as never)}
            isLoading={hierarchyMutation.isPending}
            currentCount={hierarchyCount}
          />
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <AssortmentUpload
            config={PRICING_UPLOAD_CONFIG}
            onUpload={(data) => pricingMutation.mutate(data as never)}
            isLoading={pricingMutation.isPending}
          />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <AssortmentUpload
            config={INVENTORY_UPLOAD_CONFIG}
            onUpload={(data) => inventoryMutation.mutate(data as never)}
            isLoading={inventoryMutation.isPending}
          />
        </TabsContent>

        {/* Customer Segments Tab */}
        <TabsContent value="customers">
          <AssortmentUpload
            config={CUSTOMER_SEGMENT_UPLOAD_CONFIG}
            onUpload={(data) => customersMutation.mutate(data as never)}
            isLoading={customersMutation.isPending}
          />
        </TabsContent>

        {/* Space Allocation Tab */}
        <TabsContent value="space">
          <AssortmentUpload
            config={SPACE_UPLOAD_CONFIG}
            onUpload={(data) => spaceMutation.mutate(data as never)}
            isLoading={spaceMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
