import { useQuery } from "@tanstack/react-query";

export const useGetDashboardMetricsDB = () => {
  const query = useQuery({
    queryKey: ["assortment-dashboard-metrics"],
    queryFn: async () => {
      const response = await fetch("/api/assortment-sales/dashboard-metrics");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

export const useGetWeeklyTrend = () => {
  const query = useQuery({
    queryKey: ["assortment-weekly-trend"],
    queryFn: async () => {
      const response = await fetch("/api/assortment-sales/weekly-trend");

      if (!response.ok) {
        throw new Error("Failed to fetch weekly trend");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

export const useGetCategoryMix = () => {
  const query = useQuery({
    queryKey: ["assortment-category-mix"],
    queryFn: async () => {
      const response = await fetch("/api/assortment-sales/category-mix");

      if (!response.ok) {
        throw new Error("Failed to fetch category mix");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

export const useGetBrandTierMix = () => {
  const query = useQuery({
    queryKey: ["assortment-brand-tier-mix"],
    queryFn: async () => {
      const response = await fetch("/api/assortment-sales/brand-tier-mix");

      if (!response.ok) {
        throw new Error("Failed to fetch brand tier mix");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

export const useGetTopPerformers = () => {
  const query = useQuery({
    queryKey: ["assortment-top-performers"],
    queryFn: async () => {
      const response = await fetch("/api/assortment-sales/top-performers");

      if (!response.ok) {
        throw new Error("Failed to fetch top performers");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
