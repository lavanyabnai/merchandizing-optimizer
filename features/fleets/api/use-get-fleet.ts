import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetFleet = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["fleet", { id }],
    queryFn: async () => {
      const response = await client.api.fleets[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch fleet");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
