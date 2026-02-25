import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetSalesbatche = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["salesbatche", { id }],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID is required to fetch salesbatche");
      }
      const response = await client.api.salesbatches[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch salesbatche");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
