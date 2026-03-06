import { useQuery } from "@tanstack/react-query";

export const useGetAssortmentHierarchy = () => {
  const query = useQuery({
    queryKey: ["assortment-db-hierarchy"],
    queryFn: async () => {
      const response = await fetch("/api/assortment-hierarchy");

      if (!response.ok) {
        throw new Error("Failed to fetch hierarchy");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
