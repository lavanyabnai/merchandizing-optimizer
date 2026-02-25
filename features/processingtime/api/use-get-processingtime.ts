import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetProcessingtime = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["processingtime", { id }],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID is required to fetch processingtime");
      }
      const response = await client.api.processingtime[":id"].$get({
        param: { id: id as string },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch processingtime");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
