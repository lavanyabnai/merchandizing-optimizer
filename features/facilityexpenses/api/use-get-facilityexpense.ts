import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetFacilityexpense = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["facilityexpense", { id }],
    queryFn: async () => {
      const response = await client.api.facilityexpenses[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch facilityexpense");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
