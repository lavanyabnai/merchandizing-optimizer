import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetVehicleselection = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["vehicleselection", { id }],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID is required to fetch vehicleselection");
      }
      const response = await client.api.vehicleselections[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vehicleselection");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
