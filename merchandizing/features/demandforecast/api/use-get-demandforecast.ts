import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetDemandforecast = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["demandforecast", { id }],
    queryFn: async () => {
      // The `enabled: !!id` option ensures this query function only runs when `id` is truthy.
      // Therefore, `id` can be safely asserted as non-null (string) here.
      const response = await client.api.demandforecasts[":id"].$get({
        param: { id: id! },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch demandforecast");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
