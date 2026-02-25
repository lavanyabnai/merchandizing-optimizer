import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetShipping = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["shipping", { id }],
    queryFn: async () => {
      const response = await client.api.shipping[":id"].$get({
        param: { id: id || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch shipping");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
