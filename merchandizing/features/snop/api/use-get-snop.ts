import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetAssetsconstraint = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["assetsconstraint", { id }],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID is required to fetch assetsconstraint");
      }
      const response = await client.api.assetsconstraints[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch assetsconstraint");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
