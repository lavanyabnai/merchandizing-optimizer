import { useQuery } from "@tanstack/react-query";

export const useGetAssortmentStores = () => {
  const query = useQuery({
    queryKey: ["assortment-db-stores"],
    queryFn: async () => {
      const response = await fetch("/api/assortment-stores");

      if (!response.ok) {
        throw new Error("Failed to fetch stores");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
