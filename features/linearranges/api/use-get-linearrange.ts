import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetLinearrange = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["linearrange", { id }],
    queryFn: async () => {
      const response = await client.api.linearranges[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch linearrange");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
