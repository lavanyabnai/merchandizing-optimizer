import { useQuery } from "@tanstack/react-query";

export const useGetAssortmentScenario = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["assortment-scenario", { id }],
    queryFn: async () => {
      const response = await fetch(`/api/assortment-scenarios/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch scenario");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
