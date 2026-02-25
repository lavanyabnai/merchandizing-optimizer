import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetLocation = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["location", { id }],
    queryFn: async () => {
      const response = await client.api.locations[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch location");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
