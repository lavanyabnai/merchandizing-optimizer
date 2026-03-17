import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetCo2processing = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["co2processing", { id }],
    queryFn: async () => {
      const response = await client.api.co2processing[":id"].$get({
        param: { id: id as string },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch co2processing");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
