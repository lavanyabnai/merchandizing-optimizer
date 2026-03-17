import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetGroup = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["group", { id }],
    queryFn: async () => {
      const response = await client.api.groups[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch group");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
