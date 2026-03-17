import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetLocationgroup = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["locationgroup", { id }],
    queryFn: async () => {
      const response = await client.api.locationgroups[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch locationgroup");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};