import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetDemandFulfillment = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["demandfulfillment", { id }],
    queryFn: async () => {
      const response = await client.api.demandfulfillments[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch demandfulfillment");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
