/**
 * React Query hook for fetching stores from Assortment Optimizer API
 */

import { useQuery } from "@tanstack/react-query";
import type { Store, StoreSummary } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_ASSORTMENT_API_URL || "http://localhost:8000";

interface GetStoresParams {
  format?: string;
  locationType?: string;
  incomeIndex?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

interface StoresResponse {
  items: Store[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useGetStores = (params: GetStoresParams = {}) => {
  const query = useQuery({
    queryKey: ["assortment-stores", params],
    queryFn: async (): Promise<StoresResponse> => {
      const searchParams = new URLSearchParams();

      if (params.format) searchParams.append("format", params.format);
      if (params.locationType) searchParams.append("location_type", params.locationType);
      if (params.incomeIndex) searchParams.append("income_index", params.incomeIndex);
      if (params.isActive !== undefined) searchParams.append("is_active", String(params.isActive));
      if (params.page) searchParams.append("page", String(params.page));
      if (params.pageSize) searchParams.append("page_size", String(params.pageSize));

      const url = `${API_BASE_URL}/api/v1/data/stores?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stores: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
};

export const useGetStore = (storeId?: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["assortment-store", storeId],
    queryFn: async (): Promise<Store> => {
      const url = `${API_BASE_URL}/api/v1/data/stores/${storeId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch store: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
  });

  return query;
};

export const useGetStoreOptions = () => {
  const query = useQuery({
    queryKey: ["assortment-store-options"],
    queryFn: async (): Promise<StoreSummary[]> => {
      const url = `${API_BASE_URL}/api/v1/data/stores?page_size=100`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stores: ${response.statusText}`);
      }

      const data: StoresResponse = await response.json();
      return data.items.map((store) => ({
        id: store.id,
        storeCode: store.storeCode,
        name: store.name,
        format: store.format,
        locationType: store.locationType,
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return query;
};
