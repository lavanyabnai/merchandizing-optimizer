import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetUnitconversion = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["unitconversion", { id }],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID is required to fetch unitconversion");
      }
      const response = await client.api.unitconversions[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch unitconversion");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
