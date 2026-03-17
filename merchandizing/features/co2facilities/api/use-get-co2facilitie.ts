import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetCo2facilitie = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["co2facilitie", { id }],
    queryFn: async () => {
      const response = await client.api.co2facilities[":id"].$get({
        param: { id: id as string },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch co2facilitie");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
