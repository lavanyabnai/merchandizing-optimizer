import { useQuery } from "@tanstack/react-query";

export const useGetAssortmentSales = () => {
  const query = useQuery({
    queryKey: ["assortment-db-sales"],
    queryFn: async () => {
      const response = await fetch("/api/assortment-sales");

      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
