import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetNetScenario = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["net_scenario", { id }],
    queryFn: async () => {
      const response = await client.api.net_scenarios[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch net_scenario");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
