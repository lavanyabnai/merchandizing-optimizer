"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProductTile, type ProductTileData } from "./ProductTile";
import type { BrandTier } from "@/features/assortment/types";

// Subcategory colors for legend
const SUBCATEGORY_COLORS: Record<string, string> = {
  "Soft Drinks": "#3B82F6",
  "Juices": "#F97316",
  "Water": "#06B6D4",
  "Energy Drinks": "#22C55E",
};

export interface ShelfProduct extends ProductTileData {
  xStart: number;
  xEnd: number;
  shelf: number;
}

interface ShelfDisplayProps {
  products: ShelfProduct[];
  shelfWidth: number;
  numShelves: number;
  onProductClick?: (product: ShelfProduct) => void;
  selectedProductId?: string;
}

export function ShelfDisplay({
  products,
  shelfWidth,
  numShelves,
  onProductClick,
  selectedProductId,
}: ShelfDisplayProps) {
  const [showLabels, setShowLabels] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      // Subtract padding (32px) and shelf label space (60px)
      setContainerWidth(el.clientWidth - 92);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Calculate display constants
  const pixelsPerInch = containerWidth / shelfWidth;
  const shelfHeight = 70;
  const shelfGap = 8;

  // Organize products by shelf
  const shelves = useMemo(() => {
    const shelfMap: Record<number, ShelfProduct[]> = {};

    for (let i = 0; i < numShelves; i++) {
      shelfMap[i] = [];
    }

    products.forEach((product) => {
      if (shelfMap[product.shelf]) {
        shelfMap[product.shelf].push(product);
      }
    });

    // Sort products within each shelf by x position
    Object.keys(shelfMap).forEach((shelf) => {
      shelfMap[Number(shelf)].sort((a, b) => a.xStart - b.xStart);
    });

    return shelfMap;
  }, [products, numShelves]);

  // Get unique subcategories for legend
  const subcategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => cats.add(p.subcategory));
    return Array.from(cats);
  }, [products]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              Shelf Planogram
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Visual representation of product placement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-labels" className="text-xs">
              Labels
            </Label>
            <Switch
              id="show-labels"
              checked={showLabels}
              onCheckedChange={setShowLabels}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs text-muted-foreground font-medium">
            Subcategory:
          </span>
          {subcategories.map((subcat) => (
            <div key={subcat} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor:
                    SUBCATEGORY_COLORS[subcat] || "#6B7280",
                }}
              />
              <span className="text-xs">{subcat}</span>
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-4">
            (Darker = Premium tier)
          </span>
        </div>

        {/* Shelf Display */}
        <div
          ref={containerRef}
          className="relative bg-gray-100 rounded-lg p-4 w-full"
        >
          <div className="relative" style={{ width: containerWidth + 60, maxWidth: "100%" }}>
            {Array.from({ length: numShelves }).map((_, shelfIndex) => {
              const yPosition = shelfIndex * (shelfHeight + shelfGap);
              const shelfProducts = shelves[shelfIndex] || [];

              return (
                <div
                  key={shelfIndex}
                  className="relative flex items-end"
                  style={{
                    height: shelfHeight,
                    marginBottom: shelfGap,
                  }}
                >
                  {/* Shelf Label */}
                  <div
                    className="absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-full text-xs text-muted-foreground font-medium"
                    style={{ width: 50 }}
                  >
                    Shelf {shelfIndex + 1}
                  </div>

                  {/* Shelf Background */}
                  <div
                    className="absolute inset-0 bg-gray-200 border-b-4 border-gray-400 rounded-sm"
                    style={{
                      left: 0,
                      width: containerWidth,
                    }}
                  />

                  {/* Products on Shelf */}
                  <div
                    className="relative flex items-end gap-0.5 pl-1"
                    style={{ height: shelfHeight - 4 }}
                  >
                    {shelfProducts.map((product) => (
                      <div
                        key={product.skuId}
                        style={{
                          marginLeft:
                            product === shelfProducts[0]
                              ? product.xStart * pixelsPerInch
                              : 0,
                        }}
                      >
                        <ProductTile
                          product={product}
                          shelfHeight={shelfHeight}
                          pixelsPerInch={pixelsPerInch}
                          showLabel={showLabels}
                          isSelected={selectedProductId === product.skuId}
                          onClick={() => onProductClick?.(product)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Width ruler */}
            <div
              className="flex justify-between text-xs text-muted-foreground mt-2"
              style={{ width: containerWidth, marginLeft: 0 }}
            >
              <span>0&quot;</span>
              <span>{Math.round(shelfWidth / 4)}&quot;</span>
              <span>{Math.round(shelfWidth / 2)}&quot;</span>
              <span>{Math.round((shelfWidth * 3) / 4)}&quot;</span>
              <span>{shelfWidth}&quot;</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Hover over products
          to see details. Click to select. Colors indicate subcategory;
          darker shades indicate premium brands.
        </div>
      </CardContent>
    </Card>
  );
}
