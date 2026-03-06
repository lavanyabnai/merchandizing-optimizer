import { useQuery } from "@tanstack/react-query";

export const useGetAssortmentProducts = () => {
  const query = useQuery({
    queryKey: ["assortment-db-products"],
    queryFn: async () => {
      const response = await fetch("/api/assortment-products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
