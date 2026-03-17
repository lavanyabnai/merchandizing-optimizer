/**
 * React Query hooks for optimization operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OptimizationConstraints, OptimizationResult, OptimizationSummary } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_ASSORTMENT_API_URL || "http://localhost:8000";

interface RunOptimizationParams {
  storeId?: string;
  constraints: OptimizationConstraints;
}

export const useRunOptimization = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: RunOptimizationParams): Promise<OptimizationResult> => {
      const url = `${API_BASE_URL}/api/v1/optimize/run`;

      const body = {
        store_id: params.storeId,
        constraints: {
          total_facings: params.constraints.totalFacings,
          min_facings_per_sku: params.constraints.minFacingsPerSku,
          max_facings_per_sku: params.constraints.maxFacingsPerSku,
          min_skus: params.constraints.minSkus,
          max_skus: params.constraints.maxSkus,
          must_carry: params.constraints.mustCarry,
          exclude: params.constraints.exclude,
          max_skus_per_brand: params.constraints.maxSkusPerBrand,
          min_premium_share: params.constraints.minPremiumShare,
          max_private_label_share: params.constraints.maxPrivateLabelShare,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Optimization failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Optimization complete: ${data.profitLiftPct.toFixed(1)}% profit lift`);
      queryClient.invalidateQueries({ queryKey: ["assortment-optimization"] });
      queryClient.invalidateQueries({ queryKey: ["assortment-optimization-history"] });
    },
    onError: (error) => {
      toast.error(`Optimization failed: ${error.message}`);
    },
  });

  return mutation;
};

export const useGetOptimizationResult = (runId?: string) => {
  const query = useQuery({
    enabled: !!runId,
    queryKey: ["assortment-optimization", runId],
    queryFn: async (): Promise<OptimizationResult> => {
      const url = `${API_BASE_URL}/api/v1/optimize/${runId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch optimization result: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
  });

  return query;
};

export const useGetOptimizationHistory = (storeId?: string, limit: number = 10) => {
  const query = useQuery({
    queryKey: ["assortment-optimization-history", storeId, limit],
    queryFn: async (): Promise<OptimizationSummary[]> => {
      const searchParams = new URLSearchParams();
      if (storeId) searchParams.append("store_id", storeId);
      searchParams.append("limit", String(limit));

      const url = `${API_BASE_URL}/api/v1/optimize/history?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch optimization history: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return query;
};

export const useDeleteOptimization = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (runId: string): Promise<void> => {
      const url = `${API_BASE_URL}/api/v1/optimize/${runId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete optimization: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      toast.success("Optimization result deleted");
      queryClient.invalidateQueries({ queryKey: ["assortment-optimization-history"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  return mutation;
};
