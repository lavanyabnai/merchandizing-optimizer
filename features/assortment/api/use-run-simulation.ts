/**
 * React Query hooks for Monte Carlo simulation operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SimulationConfig, SimulationResult, SimulationSummary, ScenarioType } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_ASSORTMENT_API_URL || "http://localhost:8000";

interface RunSimulationParams {
  scenarioType: ScenarioType;
  parameters: Record<string, unknown>;
  config?: Partial<SimulationConfig>;
  storeId?: string;
  optimizationRunId?: string;
}

interface RemoveSkuParams {
  skuIds: string[];
  config?: Partial<SimulationConfig>;
  storeId?: string;
}

interface AddSkuParams {
  name: string;
  brand: string;
  subcategory: string;
  size: string;
  price: number;
  cost: number;
  similarToSku?: string;
  initialFacings?: number;
  config?: Partial<SimulationConfig>;
  storeId?: string;
}

interface ChangeFacingsParams {
  skuId: string;
  newFacings: number;
  config?: Partial<SimulationConfig>;
  storeId?: string;
}

interface ChangePriceParams {
  skuId: string;
  newPrice?: number;
  priceChangePct?: number;
  config?: Partial<SimulationConfig>;
  storeId?: string;
}

const toSnakeCase = (config?: Partial<SimulationConfig>) => {
  if (!config) return undefined;
  return {
    num_trials: config.numTrials,
    demand_cv: config.demandCv,
    price_elasticity_mean: config.priceElasticityMean,
    price_elasticity_std: config.priceElasticityStd,
    space_elasticity_std: config.spaceElasticityStd,
    walk_rate_mean: config.walkRateMean,
    walk_rate_std: config.walkRateStd,
    random_seed: config.randomSeed,
  };
};

export const useRunSimulation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: RunSimulationParams): Promise<SimulationResult> => {
      const url = `${API_BASE_URL}/api/v1/simulate/run`;

      const body = {
        scenario_type: params.scenarioType,
        parameters: params.parameters,
        config: toSnakeCase(params.config),
        store_id: params.storeId,
        optimization_run_id: params.optimizationRunId,
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
        throw new Error(error.detail || `Simulation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      const impactSign = data.profitChangePct >= 0 ? "+" : "";
      toast.success(`Simulation complete: ${impactSign}${data.profitChangePct.toFixed(1)}% profit impact`);
      queryClient.invalidateQueries({ queryKey: ["assortment-simulation"] });
      queryClient.invalidateQueries({ queryKey: ["assortment-simulation-history"] });
    },
    onError: (error) => {
      toast.error(`Simulation failed: ${error.message}`);
    },
  });

  return mutation;
};

export const useSimulateRemoveSku = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: RemoveSkuParams): Promise<SimulationResult> => {
      const url = `${API_BASE_URL}/api/v1/simulate/remove-sku`;

      const body = {
        sku_ids: params.skuIds,
        config: toSnakeCase(params.config),
        store_id: params.storeId,
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
        throw new Error(error.detail || `Simulation failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("SKU removal simulation complete");
      queryClient.invalidateQueries({ queryKey: ["assortment-simulation"] });
    },
    onError: (error) => {
      toast.error(`Simulation failed: ${error.message}`);
    },
  });

  return mutation;
};

export const useSimulateAddSku = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: AddSkuParams): Promise<SimulationResult> => {
      const url = `${API_BASE_URL}/api/v1/simulate/add-sku`;

      const body = {
        name: params.name,
        brand: params.brand,
        subcategory: params.subcategory,
        size: params.size,
        price: params.price,
        cost: params.cost,
        similar_to_sku: params.similarToSku,
        initial_facings: params.initialFacings,
        config: toSnakeCase(params.config),
        store_id: params.storeId,
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
        throw new Error(error.detail || `Simulation failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("New SKU simulation complete");
      queryClient.invalidateQueries({ queryKey: ["assortment-simulation"] });
    },
    onError: (error) => {
      toast.error(`Simulation failed: ${error.message}`);
    },
  });

  return mutation;
};

export const useSimulateChangeFacings = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: ChangeFacingsParams): Promise<SimulationResult> => {
      const url = `${API_BASE_URL}/api/v1/simulate/change-facings`;

      const body = {
        sku_id: params.skuId,
        new_facings: params.newFacings,
        config: toSnakeCase(params.config),
        store_id: params.storeId,
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
        throw new Error(error.detail || `Simulation failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Facings change simulation complete");
      queryClient.invalidateQueries({ queryKey: ["assortment-simulation"] });
    },
    onError: (error) => {
      toast.error(`Simulation failed: ${error.message}`);
    },
  });

  return mutation;
};

export const useSimulateChangePrice = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: ChangePriceParams): Promise<SimulationResult> => {
      const url = `${API_BASE_URL}/api/v1/simulate/change-price`;

      const body = {
        sku_id: params.skuId,
        new_price: params.newPrice,
        price_change_pct: params.priceChangePct,
        config: toSnakeCase(params.config),
        store_id: params.storeId,
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
        throw new Error(error.detail || `Simulation failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Price change simulation complete");
      queryClient.invalidateQueries({ queryKey: ["assortment-simulation"] });
    },
    onError: (error) => {
      toast.error(`Simulation failed: ${error.message}`);
    },
  });

  return mutation;
};

export const useGetSimulationResult = (runId?: string) => {
  const query = useQuery({
    enabled: !!runId,
    queryKey: ["assortment-simulation", runId],
    queryFn: async (): Promise<SimulationResult> => {
      const url = `${API_BASE_URL}/api/v1/simulate/${runId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch simulation result: ${response.statusText}`);
      }

      return response.json();
    },
  });

  return query;
};

export const useGetSimulationHistory = (limit: number = 10) => {
  const query = useQuery({
    queryKey: ["assortment-simulation-history", limit],
    queryFn: async (): Promise<SimulationSummary[]> => {
      const url = `${API_BASE_URL}/api/v1/simulate/history?limit=${limit}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch simulation history: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return query;
};
