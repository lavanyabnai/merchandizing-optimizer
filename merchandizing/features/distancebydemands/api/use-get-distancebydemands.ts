import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetDistancebydemands = () => {
  const query = useQuery({
    queryKey: ["distancebydemands"],
    queryFn: async () => {
      const response = await client.api.distancebydemands.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch distance by demands");
      }

      const json = await response.json();

      if ("error" in json) {
        throw new Error(json.error as string);
      }

      return json.data;
    },
  });

  return query;
};
