import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetSupplier = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["supplier", { id }],
    queryFn: async () => {
      const response = await client.api.suppliers[":id"].$get({
        param: { id: id ?? '' },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch supplier");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
