import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetLocations = () => {
  const query = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await client.api.locations.$get();
      // const response = await fetch('/api/locations', {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });

      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }

      const { data } = await response.json();
      
      // Return empty array if data is undefined
      return data ?? [];
    },
  });

  return query;
};
