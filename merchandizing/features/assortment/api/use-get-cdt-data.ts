/**
 * React Query hooks for CDT (Consumer Decision Tree) data
 */

import { useQuery } from "@tanstack/react-query";
import type { Product } from "../types";
import type { CDTNode } from "../components/cdt/SunburstChart";
import type { SwitchingMatrixData } from "../components/cdt/SwitchingMatrix";
import type { AttributeData } from "../components/cdt/AttributeImportance";
import type { SwitchingBehaviorData } from "../components/cdt/SwitchingBehavior";

const API_BASE_URL = process.env.NEXT_PUBLIC_ASSORTMENT_API_URL || "http://localhost:8000";

// Build CDT hierarchy from products and sales data
export function buildCDTHierarchy(
  products: Product[],
  salesByProduct: Map<string, number>
): CDTNode {
  // Group by subcategory -> brand -> size
  const hierarchy: Map<string, Map<string, Map<string, number>>> = new Map();

  for (const product of products) {
    const revenue = salesByProduct.get(product.id) || 0;
    if (revenue === 0) continue;

    if (!hierarchy.has(product.subcategory)) {
      hierarchy.set(product.subcategory, new Map());
    }
    const subcatMap = hierarchy.get(product.subcategory)!;

    if (!subcatMap.has(product.brand)) {
      subcatMap.set(product.brand, new Map());
    }
    const brandMap = subcatMap.get(product.brand)!;

    const sizeKey = product.size || "Standard";
    brandMap.set(sizeKey, (brandMap.get(sizeKey) || 0) + revenue);
  }

  // Convert to CDTNode structure
  const root: CDTNode = {
    id: "beverages",
    name: "Beverages",
    children: [],
  };

  hierarchy.forEach((subcatMap, subcategory) => {
    const subcatNode: CDTNode = {
      id: `subcat-${subcategory}`,
      name: subcategory,
      children: [],
      parent: "beverages",
    };

    subcatMap.forEach((brandMap, brand) => {
      const brandNode: CDTNode = {
        id: `brand-${subcategory}-${brand}`,
        name: brand,
        children: [],
        parent: subcatNode.id,
      };

      brandMap.forEach((revenue, size) => {
        brandNode.children!.push({
          id: `size-${subcategory}-${brand}-${size}`,
          name: size,
          value: revenue,
          parent: brandNode.id,
        });
      });

      subcatNode.children!.push(brandNode);
    });

    root.children!.push(subcatNode);
  });

  return root;
}

// Generate synthetic switching matrix data
function generateSwitchingData(
  items: string[],
  type: "brand" | "subcategory"
): SwitchingMatrixData[] {
  const data: SwitchingMatrixData[] = [];
  const seed = type === "brand" ? 42 : 123;

  // Simple seeded random for consistency
  const random = (i: number, j: number) => {
    const x = Math.sin(seed + i * 100 + j) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (i === j) continue;

      // Higher probability for items in similar position (proxy for similarity)
      const baseProbability = type === "brand" ? 0.25 : 0.35;
      const variance = random(i, j) * 0.3;
      const probability = Math.min(0.6, Math.max(0.1, baseProbability + variance - 0.15));

      data.push({
        from: items[i],
        to: items[j],
        probability: Math.round(probability * 100) / 100,
      });
    }
  }

  return data;
}

interface CDTDataResponse {
  hierarchy: CDTNode;
  brandSwitching: SwitchingMatrixData[];
  subcategorySwitching: SwitchingMatrixData[];
  attributeImportance: AttributeData[];
  switchingBehavior: SwitchingBehaviorData[];
}

export const useGetCDTData = (storeId?: string) => {
  const query = useQuery({
    queryKey: ["assortment-cdt-data", storeId],
    queryFn: async (): Promise<CDTDataResponse> => {
      // Fetch products
      const productsUrl = `${API_BASE_URL}/api/v1/data/products?page_size=500${
        storeId ? `&store_id=${storeId}` : ""
      }`;
      const productsResponse = await fetch(productsUrl);

      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
      }

      const productsData = await productsResponse.json();
      const products: Product[] = productsData.items || [];

      // Fetch sales for revenue data
      const salesUrl = `${API_BASE_URL}/api/v1/data/sales?page_size=10000${
        storeId ? `&store_id=${storeId}` : ""
      }`;
      const salesResponse = await fetch(salesUrl);

      let salesByProduct = new Map<string, number>();

      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        const sales = salesData.items || [];

        for (const sale of sales) {
          const current = salesByProduct.get(sale.productId) || 0;
          salesByProduct.set(sale.productId, current + sale.revenue);
        }
      }

      // Build hierarchy
      const hierarchy = buildCDTHierarchy(products, salesByProduct);

      // Get unique brands and subcategories
      const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
      const subcategories = Array.from(new Set(products.map((p) => p.subcategory))).sort();

      // Generate switching matrices
      const brandSwitching = generateSwitchingData(brands, "brand");
      const subcategorySwitching = generateSwitchingData(subcategories, "subcategory");

      // Static attribute importance (would come from research/API in production)
      const attributeImportance: AttributeData[] = [
        {
          attribute: "Subcategory",
          importance: 0.36,
          description: "Shoppers decide what type of beverage they want first",
        },
        {
          attribute: "Brand",
          importance: 0.28,
          description: "Brand preference within the chosen category",
        },
        {
          attribute: "Size/Pack",
          importance: 0.21,
          description: "Package size based on consumption occasion",
        },
        {
          attribute: "Price",
          importance: 0.15,
          description: "Final decision factor between options",
        },
      ];

      // Static switching behavior (would come from research/API in production)
      const switchingBehavior: SwitchingBehaviorData[] = [
        {
          type: "Same brand, different flavor",
          probability: 0.27,
          description: "Customer stays loyal to brand but picks different variant",
          icon: "sameBrandFlavor",
        },
        {
          type: "Same brand, different size",
          probability: 0.23,
          description: "Customer picks different pack size of same brand",
          icon: "sameBrandSize",
        },
        {
          type: "Different brand, same category",
          probability: 0.20,
          description: "Customer switches to competing brand in same subcategory",
          icon: "differentBrand",
        },
        {
          type: "Different category",
          probability: 0.21,
          description: "Customer switches to different beverage type entirely",
          icon: "differentCategory",
        },
        {
          type: "Walk away",
          probability: 0.09,
          description: "Customer leaves without making a purchase",
          icon: "walkAway",
        },
      ];

      return {
        hierarchy,
        brandSwitching,
        subcategorySwitching,
        attributeImportance,
        switchingBehavior,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return query;
};

// Hook to get switching matrix from API (when available)
export const useGetSwitchingMatrix = (level: "brand" | "subcategory" = "brand") => {
  const query = useQuery({
    queryKey: ["assortment-switching-matrix", level],
    queryFn: async (): Promise<SwitchingMatrixData[]> => {
      const url = `${API_BASE_URL}/api/v1/demand/switching-matrix?level=${level}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Return empty array if endpoint doesn't exist yet
        console.warn(`Switching matrix endpoint not available: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry if endpoint doesn't exist
  });

  return query;
};
