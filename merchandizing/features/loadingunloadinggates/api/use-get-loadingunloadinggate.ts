import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetLoadingunloadinggate = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["loadingunloadinggate", { id }],
    queryFn: async () => {
      const response = await client.api.loadingunloadinggates[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch loadingunloadinggate");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
