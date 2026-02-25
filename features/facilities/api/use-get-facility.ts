import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetFacility = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["facility", { id }],
    queryFn: async () => {
      const response = await client.api.facilities[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch facility");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
