/**
 * React Query hooks for store clustering operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ClusteringMethod,
  ClusteringResult,
  ClusteringSummary,
  ClusterProfile,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_ASSORTMENT_API_URL || "http://localhost:8000";

interface RunClusteringParams {
  method?: ClusteringMethod;
  nClusters?: number;
  maxClusters?: number;
  features?: string[];
  randomSeed?: number;
}

interface OptimalKResult {
  optimalK: number;
  kValues: number[];
  silhouetteScores: number[];
  inertias: number[];
}

export const useRunClustering = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: RunClusteringParams = {}): Promise<ClusteringResult> => {
      const url = `${API_BASE_URL}/api/v1/cluster/run`;

      const body = {
        method: params.method || "kmeans",
        n_clusters: params.nClusters,
        max_clusters: params.maxClusters || 10,
        features: params.features || ["revenue", "premium_share", "traffic"],
        random_seed: params.randomSeed ?? 42,
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
        throw new Error(error.detail || `Clustering failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Clustering complete: ${data.nClusters} clusters (silhouette: ${data.silhouetteScore.toFixed(3)})`
      );
      queryClient.invalidateQueries({ queryKey: ["assortment-clustering"] });
      queryClient.invalidateQueries({ queryKey: ["assortment-clustering-history"] });
    },
    onError: (error) => {
      toast.error(`Clustering failed: ${error.message}`);
    },
  });

  return mutation;
};

export const useGetClusteringResult = (runId?: string) => {
  const query = useQuery({
    enabled: !!runId,
    queryKey: ["assortment-clustering", runId],
    queryFn: async (): Promise<ClusteringResult> => {
      const url = `${API_BASE_URL}/api/v1/cluster/${runId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch clustering result: ${response.statusText}`);
      }

      return response.json();
    },
  });

  return query;
};

export const useGetClusterProfiles = (runId?: string) => {
  const query = useQuery({
    enabled: !!runId,
    queryKey: ["assortment-clustering-profiles", runId],
    queryFn: async (): Promise<ClusterProfile[]> => {
      const url = `${API_BASE_URL}/api/v1/cluster/${runId}/profiles`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cluster profiles: ${response.statusText}`);
      }

      return response.json();
    },
  });

  return query;
};

export const useGetClusterRecommendations = (runId?: string) => {
  const query = useQuery({
    enabled: !!runId,
    queryKey: ["assortment-clustering-recommendations", runId],
    queryFn: async () => {
      const url = `${API_BASE_URL}/api/v1/cluster/${runId}/recommendations`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      return response.json();
    },
  });

  return query;
};

export const useGetClusterVisualization = (runId?: string) => {
  const query = useQuery({
    enabled: !!runId,
    queryKey: ["assortment-clustering-visualization", runId],
    queryFn: async () => {
      const url = `${API_BASE_URL}/api/v1/cluster/${runId}/visualization`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch visualization data: ${response.statusText}`);
      }

      return response.json();
    },
  });

  return query;
};

export const useGetOptimalK = (maxK: number = 10) => {
  const query = useQuery({
    queryKey: ["assortment-clustering-optimal-k", maxK],
    queryFn: async (): Promise<OptimalKResult> => {
      const url = `${API_BASE_URL}/api/v1/cluster/optimal-k?max_k=${maxK}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to find optimal K: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return query;
};

export const useGetClusteringHistory = (limit: number = 10) => {
  const query = useQuery({
    queryKey: ["assortment-clustering-history", limit],
    queryFn: async (): Promise<ClusteringSummary[]> => {
      const url = `${API_BASE_URL}/api/v1/cluster/history?limit=${limit}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch clustering history: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return query;
};

export const useDeleteClustering = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (runId: string): Promise<void> => {
      const url = `${API_BASE_URL}/api/v1/cluster/${runId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete clustering: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      toast.success("Clustering result deleted");
      queryClient.invalidateQueries({ queryKey: ["assortment-clustering-history"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  return mutation;
};
