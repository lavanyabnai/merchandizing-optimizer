import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetdistancebydemand = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["distancebydemand", { id }],
    queryFn: async () => {
      const response = await client.api.distancebydemands[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch distancebydemand");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
