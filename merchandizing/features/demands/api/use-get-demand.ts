import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetDemand = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["demand", { id }],
    queryFn: async () => {
      const response = await client.api.demands[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch demand");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
