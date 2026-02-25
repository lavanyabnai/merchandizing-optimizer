import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetobjectivemember = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["objectivemember", { id }],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID is required to fetch objectivemember");
      }
      const response = await client.api.objectivemembers[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch objectivemembers");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
