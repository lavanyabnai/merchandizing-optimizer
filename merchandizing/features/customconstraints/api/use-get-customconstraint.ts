import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetcustomconstraint = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["customconstraint", { id }],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID is required to fetch customconstraint");
      }
      const response = await client.api.customconstraints[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customconstraint");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
