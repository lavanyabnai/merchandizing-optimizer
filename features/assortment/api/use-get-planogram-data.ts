/**
 * React Query hooks for planogram data operations
 */

import { useQuery } from "@tanstack/react-query";
import type { BrandTier } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_ASSORTMENT_API_URL || "http://localhost:8000";

export interface PlanogramProduct {
  skuId: string;
  name: string;
  brand: string;
  brandTier: BrandTier;
  subcategory: string;
  size: string;
  price: number;
  widthInches: number;
  facings: number;
  revenue: number;
  profit: number;
}

export interface ShelfPlacement {
  skuId: string;
  shelf: number;
  xStart: number;
  xEnd: number;
  facings: number;
}

export interface PlanogramData {
  storeId?: string;
  optimizationRunId?: string;
  shelfWidth: number;
  numShelves: number;
  products: PlanogramProduct[];
  placements: ShelfPlacement[];
  totalFacings: number;
  totalLinearInches: number;
  utilization: number;
  createdAt: string;
}

interface GetPlanogramParams {
  storeId?: string;
  optimizationRunId?: string;
  shelfWidth?: number;
  numShelves?: number;
}

export const useGetPlanogramData = (params: GetPlanogramParams = {}) => {
  const { storeId, optimizationRunId, shelfWidth = 48, numShelves = 4 } = params;

  const query = useQuery({
    enabled: !!optimizationRunId || !!storeId,
    queryKey: ["assortment-planogram", storeId, optimizationRunId, shelfWidth, numShelves],
    queryFn: async (): Promise<PlanogramData> => {
      const searchParams = new URLSearchParams();

      if (storeId) searchParams.append("store_id", storeId);
      if (optimizationRunId) searchParams.append("optimization_run_id", optimizationRunId);
      searchParams.append("shelf_width", String(shelfWidth));
      searchParams.append("num_shelves", String(numShelves));

      const url = `${API_BASE_URL}/api/v1/planogram?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Failed to fetch planogram: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
};

export const useGetOptimizedAssortment = (optimizationRunId?: string) => {
  const query = useQuery({
    enabled: !!optimizationRunId,
    queryKey: ["assortment-optimized", optimizationRunId],
    queryFn: async (): Promise<PlanogramProduct[]> => {
      const url = `${API_BASE_URL}/api/v1/optimization/${optimizationRunId}/assortment`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Failed to fetch assortment: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return query;
};

/**
 * Calculate shelf placements from product list
 * This can be used client-side when API doesn't provide placements
 */
export function calculateShelfPlacements(
  products: PlanogramProduct[],
  shelfWidth: number,
  numShelves: number
): ShelfPlacement[] {
  const placements: ShelfPlacement[] = [];

  // Sort products by subcategory then brand for organized display
  const sortedProducts = [...products].sort((a, b) => {
    const subcatCompare = a.subcategory.localeCompare(b.subcategory);
    if (subcatCompare !== 0) return subcatCompare;
    return a.brand.localeCompare(b.brand);
  });

  let currentShelf = 0;
  let currentX = 0;

  for (const product of sortedProducts) {
    const productWidth = product.widthInches * product.facings;

    // Check if we need to move to next shelf
    if (currentX + productWidth > shelfWidth) {
      currentShelf++;
      currentX = 0;

      if (currentShelf >= numShelves) {
        break; // No more space
      }
    }

    placements.push({
      skuId: product.skuId,
      shelf: currentShelf,
      xStart: currentX,
      xEnd: currentX + productWidth,
      facings: product.facings,
    });

    currentX += productWidth + 0.5; // Small gap between products
  }

  return placements;
}

/**
 * Merge products with placements to create ShelfProduct format
 */
export function createShelfProducts(
  products: PlanogramProduct[],
  placements: ShelfPlacement[]
): Array<PlanogramProduct & ShelfPlacement> {
  const productMap = new Map(products.map((p) => [p.skuId, p]));

  return placements
    .map((placement) => {
      const product = productMap.get(placement.skuId);
      if (!product) return null;

      return {
        ...product,
        ...placement,
      };
    })
    .filter((p): p is PlanogramProduct & ShelfPlacement => p !== null);
}
