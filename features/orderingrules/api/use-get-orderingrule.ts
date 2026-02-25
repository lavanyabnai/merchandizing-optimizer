import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetOrderingrule = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["orderingrule", { id }],
    queryFn: async () => {
      const response = await client.api.orderingrules[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orderingrule");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
