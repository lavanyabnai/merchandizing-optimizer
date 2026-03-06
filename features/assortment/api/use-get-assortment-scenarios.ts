import { useQuery } from "@tanstack/react-query";

export const useGetAssortmentScenarios = (type?: string) => {
  const query = useQuery({
    queryKey: ["assortment-scenarios", { type }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      const url = params.toString()
        ? `/api/assortment-scenarios?${params.toString()}`
        : "/api/assortment-scenarios";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch scenarios");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
