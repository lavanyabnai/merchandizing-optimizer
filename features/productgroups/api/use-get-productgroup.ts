import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetProductgroup = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["productgroup", { id }],
    queryFn: async () => {
      const response = await client.api.productgroups[":id"].$get({
        param: { id: id || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch productgroup");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
