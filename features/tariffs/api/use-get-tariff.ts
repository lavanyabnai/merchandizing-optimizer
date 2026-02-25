import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTariff = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["tariff", { id }],
    queryFn: async () => {
      const response = await client.api.tariffs[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tariff");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
