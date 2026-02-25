/**
 * React Query hook for fetching products from Assortment Optimizer API
 */

import { useQuery } from "@tanstack/react-query";
import type { Product } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_ASSORTMENT_API_URL || "http://localhost:8000";

interface GetProductsParams {
  storeId?: string;
  subcategory?: string;
  brandTier?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useGetProducts = (params: GetProductsParams = {}) => {
  const query = useQuery({
    queryKey: ["assortment-products", params],
    queryFn: async (): Promise<ProductsResponse> => {
      const searchParams = new URLSearchParams();

      if (params.storeId) searchParams.append("store_id", params.storeId);
      if (params.subcategory) searchParams.append("subcategory", params.subcategory);
      if (params.brandTier) searchParams.append("brand_tier", params.brandTier);
      if (params.isActive !== undefined) searchParams.append("is_active", String(params.isActive));
      if (params.page) searchParams.append("page", String(params.page));
      if (params.pageSize) searchParams.append("page_size", String(params.pageSize));

      const url = `${API_BASE_URL}/api/v1/data/products?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
};

export const useGetProduct = (productId?: string) => {
  const query = useQuery({
    enabled: !!productId,
    queryKey: ["assortment-product", productId],
    queryFn: async (): Promise<Product> => {
      const url = `${API_BASE_URL}/api/v1/data/products/${productId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
  });

  return query;
};

export const useGetSubcategories = () => {
  const query = useQuery({
    queryKey: ["assortment-subcategories"],
    queryFn: async (): Promise<string[]> => {
      const url = `${API_BASE_URL}/api/v1/data/subcategories`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subcategories: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return query;
};
