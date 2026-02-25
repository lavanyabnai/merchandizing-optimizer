import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetProcessingcost = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["processingcost", { id }],
    queryFn: async () => {
      const response = await client.api.processingcosts[":id"].$get({
        param: { id: id || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch processingcost");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
