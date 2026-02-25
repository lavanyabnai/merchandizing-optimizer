import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetSourcing = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["sourcing", { id }],
    queryFn: async () => {
      const response = await client.api.sourcing[":id"].$get({
        param: { id: id! },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sourcing");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
