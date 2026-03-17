"use client";

import { memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { BrandTier } from "@/features/assortment/types";

// Subcategory colors
const SUBCATEGORY_COLORS: Record<string, string> = {
  "Soft Drinks": "#3B82F6", // Blue
  "Juices": "#F97316",      // Orange
  "Water": "#06B6D4",       // Light Blue/Cyan
  "Energy Drinks": "#22C55E", // Green
  "Cola": "#3B82F6",
  "Lemon-Lime": "#84CC16",
  "Orange": "#F97316",
  "Root Beer": "#A855F7",
  "Sparkling Water": "#06B6D4",
};

// Brand tier opacity modifiers
const BRAND_TIER_OPACITY: Record<BrandTier, number> = {
  "Premium": 1.0,
  "National A": 0.85,
  "National B": 0.70,
  "Store Brand": 0.55,
};

export interface ProductTileData {
  skuId: string;
  name: string;
  brand: string;
  brandTier: BrandTier;
  subcategory: string;
  size: string;
  price: number;
  facings: number;
  widthInches: number;
  revenue?: number;
}

interface ProductTileProps {
  product: ProductTileData;
  shelfHeight: number;
  pixelsPerInch: number;
  showLabel?: boolean;
  isSelected?: boolean;
  onClick?: (product: ProductTileData) => void;
}

function getProductColor(subcategory: string, brandTier: BrandTier): string {
  const baseColor = SUBCATEGORY_COLORS[subcategory] || "#6B7280";
  const opacity = BRAND_TIER_OPACITY[brandTier] || 0.7;

  // For CSS, we'll use the base color with opacity
  return baseColor;
}

export const ProductTile = memo(function ProductTile({
  product,
  shelfHeight,
  pixelsPerInch,
  showLabel = true,
  isSelected = false,
  onClick,
}: ProductTileProps) {
  const totalWidth = product.widthInches * product.facings * pixelsPerInch;
  const opacity = BRAND_TIER_OPACITY[product.brandTier] || 0.7;
  const baseColor = SUBCATEGORY_COLORS[product.subcategory] || "#6B7280";

  // Truncate name based on width
  const truncatedName = totalWidth > 60
    ? product.name.slice(0, 12)
    : totalWidth > 40
    ? product.brand.slice(0, 6)
    : "";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative flex items-center justify-center cursor-pointer transition-all",
              "border border-gray-600 rounded-sm overflow-hidden",
              "hover:ring-2 hover:ring-primary hover:z-10",
              isSelected && "ring-2 ring-primary z-10"
            )}
            style={{
              width: `${totalWidth}px`,
              height: `${shelfHeight - 8}px`,
              backgroundColor: baseColor,
              opacity,
            }}
            onClick={() => onClick?.(product)}
          >
            {showLabel && truncatedName && (
              <span
                className="text-white text-[8px] font-medium text-center px-0.5 leading-tight"
                style={{
                  writingMode: totalWidth < 40 ? "vertical-rl" : "horizontal-tb",
                  textOrientation: totalWidth < 40 ? "mixed" : "mixed",
                }}
              >
                {truncatedName}
              </span>
            )}

            {/* Facings indicator */}
            {product.facings > 1 && totalWidth > 30 && (
              <span className="absolute bottom-0.5 right-0.5 text-[7px] text-white/80 font-bold">
                x{product.facings}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium text-sm">{product.name}</p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Brand: {product.brand}</p>
              <p>Size: {product.size}</p>
              <p>Price: ${product.price.toFixed(2)}</p>
              <p>Facings: {product.facings}</p>
              <p>Width: {(product.widthInches * product.facings).toFixed(1)}&quot;</p>
              {product.revenue !== undefined && (
                <p>Revenue: ${product.revenue.toLocaleString()}</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
