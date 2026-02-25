import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetInventory = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["inventory", { id }],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID is required to fetch inventory");
      }
      const response = await client.api.inventorys[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
