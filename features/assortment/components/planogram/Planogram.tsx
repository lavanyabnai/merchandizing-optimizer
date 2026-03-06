"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Info,
  ChevronDown,
  LayoutGrid,
  AlertTriangle,
} from "lucide-react";

import { ShelfConfig, type ShelfConfigValues } from "./ShelfConfig";
import { ShelfDisplay, type ShelfProduct } from "./ShelfDisplay";
import { SpaceMetrics } from "./SpaceMetrics";
import type { BrandTier, Product } from "@/features/assortment/types";

// Demo data generators
function generateDemoProducts(
  shelfWidth: number,
  numShelves: number
): ShelfProduct[] {
  const brands = [
    { name: "Coca-Cola", tier: "Premium" as BrandTier },
    { name: "Pepsi", tier: "Premium" as BrandTier },
    { name: "Sprite", tier: "National A" as BrandTier },
    { name: "7-Up", tier: "National A" as BrandTier },
    { name: "Fanta", tier: "National A" as BrandTier },
    { name: "Store Brand Cola", tier: "Store Brand" as BrandTier },
    { name: "Red Bull", tier: "Premium" as BrandTier },
    { name: "Monster", tier: "National A" as BrandTier },
    { name: "LaCroix", tier: "National A" as BrandTier },
    { name: "Poland Spring", tier: "National B" as BrandTier },
    { name: "Dasani", tier: "National A" as BrandTier },
    { name: "Tropicana", tier: "Premium" as BrandTier },
    { name: "Minute Maid", tier: "National A" as BrandTier },
    { name: "Simply", tier: "Premium" as BrandTier },
    { name: "Store Brand Water", tier: "Store Brand" as BrandTier },
  ];

  const subcategories = ["Soft Drinks", "Juices", "Water", "Energy Drinks"];
  const sizes = ["12oz Can", "20oz Bottle", "2L Bottle"];

  const products: ShelfProduct[] = [];
  let currentShelf = 0;
  let currentX = 0;

  // Sort by subcategory for organized display
  const sortedBrands = [...brands].sort((a, b) => {
    const subcatA = getSubcategoryForBrand(a.name);
    const subcatB = getSubcategoryForBrand(b.name);
    return subcatA.localeCompare(subcatB);
  });

  sortedBrands.forEach((brand, index) => {
    const subcategory = getSubcategoryForBrand(brand.name);
    const size = sizes[index % sizes.length];
    const widthInches = 2.5 + Math.random() * 2;
    const facings = 1 + Math.floor(Math.random() * 4);
    const productWidth = widthInches * facings;

    // Check if we need to move to next shelf
    if (currentX + productWidth > shelfWidth) {
      currentShelf++;
      currentX = 0;

      if (currentShelf >= numShelves) {
        return; // No more space
      }
    }

    products.push({
      skuId: `sku-${index + 1}`,
      name: `${brand.name} ${size}`,
      brand: brand.name.replace(" Cola", "").replace(" Water", ""),
      brandTier: brand.tier,
      subcategory,
      size,
      price: 1.99 + Math.random() * 3,
      facings,
      widthInches,
      revenue: 100 + Math.random() * 500,
      xStart: currentX,
      xEnd: currentX + productWidth,
      shelf: currentShelf,
    });

    currentX += productWidth + 0.5; // Small gap between products
  });

  return products;
}

function getSubcategoryForBrand(brand: string): string {
  if (brand.includes("Cola") || brand.includes("Sprite") || brand.includes("7-Up") || brand.includes("Fanta") || brand.includes("Pepsi")) {
    return "Soft Drinks";
  }
  if (brand.includes("Red Bull") || brand.includes("Monster")) {
    return "Energy Drinks";
  }
  if (brand.includes("Water") || brand.includes("LaCroix") || brand.includes("Poland") || brand.includes("Dasani")) {
    return "Water";
  }
  if (brand.includes("Tropicana") || brand.includes("Minute") || brand.includes("Simply")) {
    return "Juices";
  }
  return "Soft Drinks";
}

interface PlanogramProps {
  useDemoData?: boolean;
}

export function Planogram({ useDemoData = true }: PlanogramProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [shelfConfig, setShelfConfig] = useState<ShelfConfigValues>({
    shelfWidth: 48,
    numShelves: 4,
  });
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();

  // Generate products based on shelf configuration
  const products = useMemo(() => {
    if (useDemoData) {
      return generateDemoProducts(shelfConfig.shelfWidth, shelfConfig.numShelves);
    }
    // In real implementation, this would come from API
    return [];
  }, [useDemoData, shelfConfig.shelfWidth, shelfConfig.numShelves]);

  const handleProductClick = useCallback((product: ShelfProduct) => {
    setSelectedProductId((prev) =>
      prev === product.skuId ? undefined : product.skuId
    );
  }, []);

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
          About Planograms
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isAboutOpen ? "rotate-180" : ""}`}
          />
        </Button>
        {isAboutOpen && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">
              What is a Planogram?
            </p>
            <p className="mb-3">
              A planogram is a visual diagram showing how products should be
              arranged on retail shelves. It specifies which products to display,
              how many facings each gets, and where products are positioned.
            </p>
            <p className="font-medium text-foreground mb-2">Why Planograms Matter:</p>
            <ul className="list-disc list-inside space-y-1 text-xs mb-3">
              <li>
                <strong>Consistency:</strong> Ensures all stores execute the same strategy
              </li>
              <li>
                <strong>Productivity:</strong> Optimal space allocation maximizes sales per foot
              </li>
              <li>
                <strong>Shopper Experience:</strong> Logical organization helps customers find products
              </li>
              <li>
                <strong>Replenishment:</strong> Clear layouts speed up restocking
              </li>
            </ul>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This is a visualization based on the optimized assortment.
                Colors indicate subcategory; darker shades indicate premium
                brands. Hover over products for details.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 grid-cols-[1fr_2fr] w-full">
        {/* Left Panel: Configuration */}
        <div>
          <ShelfConfig
            values={shelfConfig}
            onChange={setShelfConfig}
          />
        </div>

        {/* Right Panel: Planogram Display */}
        {/* Right Panel: Planogram Display */}
        <div className="space-y-6 w-full">
          {products.length > 0 ? (
            <>
              {/* Shelf Display */}
              <ShelfDisplay
                products={products}
                shelfWidth={shelfConfig.shelfWidth}
                numShelves={shelfConfig.numShelves}
                onProductClick={handleProductClick}
                selectedProductId={selectedProductId}
              />

              {/* Space Metrics */}
              <SpaceMetrics
                products={products}
                shelfWidth={shelfConfig.shelfWidth}
                numShelves={shelfConfig.numShelves}
              />
            </>
          ) : (
            /* Empty State */
            <Card className="h-full min-h-[500px]">
              <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Planogram Data</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Run an optimization first to generate an assortment, then view
                  the planogram visualization here.
                </p>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Configure shelf dimensions
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Products arranged by subcategory
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    View space utilization metrics
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
