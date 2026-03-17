import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetCashaccount = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["cashaccount", { id }],
    queryFn: async () => {
      const response = await client.api.cashaccounts[":id"].$get({
        param: { id: id as string },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cashaccount");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
