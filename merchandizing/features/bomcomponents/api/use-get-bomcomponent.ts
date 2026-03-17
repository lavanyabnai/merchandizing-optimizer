import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetBomcomponent = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["bomcomponent", { id }],
    queryFn: async () => {
      const response = await client.api.bomcomponents[":id"].$get({
        param: { id: id as string },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bomcomponent");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
