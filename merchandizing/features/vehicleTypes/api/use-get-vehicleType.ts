import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetvehicleType = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["vehicleType", { id }],
    queryFn: async () => {
      const response = await client.api.vehicleTypes[":id"].$get({
        param: { id: id as string },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vehicleType");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
