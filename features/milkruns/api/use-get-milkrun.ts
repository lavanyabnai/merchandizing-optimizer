import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetMilkrun = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["milkrun", { id }],
    queryFn: async () => {
      const response = await client.api.milkruns[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch milkrun");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
