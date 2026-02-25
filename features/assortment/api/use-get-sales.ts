/**
 * React Query hook for fetching sales data from Assortment Optimizer API
 */

import { useQuery } from "@tanstack/react-query";
import type { Sale, SalesSummary, DashboardMetrics } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_ASSORTMENT_API_URL || "http://localhost:8000";

interface GetSalesParams {
  storeId?: string;
  productId?: string;
  weekStart?: number;
  weekEnd?: number;
  year?: number;
  page?: number;
  pageSize?: number;
}

interface SalesResponse {
  items: Sale[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useGetSales = (params: GetSalesParams = {}) => {
  const query = useQuery({
    queryKey: ["assortment-sales", params],
    queryFn: async (): Promise<SalesResponse> => {
      const searchParams = new URLSearchParams();

      if (params.storeId) searchParams.append("store_id", params.storeId);
      if (params.productId) searchParams.append("product_id", params.productId);
      if (params.weekStart) searchParams.append("week_start", String(params.weekStart));
      if (params.weekEnd) searchParams.append("week_end", String(params.weekEnd));
      if (params.year) searchParams.append("year", String(params.year));
      if (params.page) searchParams.append("page", String(params.page));
      if (params.pageSize) searchParams.append("page_size", String(params.pageSize));

      const url = `${API_BASE_URL}/api/v1/data/sales?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sales: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return query;
};

export const useGetSalesSummary = (storeId?: string, subcategories?: string[]) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["assortment-sales-summary", storeId, subcategories],
    queryFn: async (): Promise<SalesSummary[]> => {
      const searchParams = new URLSearchParams();
      if (storeId) searchParams.append("store_id", storeId);
      if (subcategories?.length) {
        subcategories.forEach((s) => searchParams.append("subcategory", s));
      }

      const url = `${API_BASE_URL}/api/v1/data/sales/summary?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sales summary: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
};

export const useGetDashboardMetrics = (storeId?: string) => {
  const query = useQuery({
    queryKey: ["assortment-dashboard-metrics", storeId],
    queryFn: async (): Promise<DashboardMetrics> => {
      const searchParams = new URLSearchParams();
      if (storeId) searchParams.append("store_id", storeId);

      const url = `${API_BASE_URL}/api/v1/data/metrics?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard metrics: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
};
