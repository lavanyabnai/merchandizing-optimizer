import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetProductflow = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["productflow", { id }],
    queryFn: async () => {
      const response = await client.api.productflows[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch productflow");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
