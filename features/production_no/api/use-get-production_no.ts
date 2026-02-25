import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetProduction_no = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["production_no", { id }],
    queryFn: async () => {
      const response = await client.api.production_no[":id"].$get({
        param: { id: id || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch production_no");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
