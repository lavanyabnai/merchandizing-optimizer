import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetSitestatechange = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["sitestatechange", { id }],
    queryFn: async () => {
      const response = await client.api.sitestatechanges[":id"].$get({
        param: { id: id || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sitestatechange");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
