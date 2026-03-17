import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetBom = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["bom", { id }],
    queryFn: async () => {
      if (!id) throw new Error("BOM ID is required");
      
      const response = await client.api.boms[":id"].$get({
        param: { id: id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bom");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
