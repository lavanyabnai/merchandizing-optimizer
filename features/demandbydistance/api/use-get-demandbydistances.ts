import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetdemandbydistances = () => {
  const query = useQuery({
    queryKey: ["demandbydistances"],
    queryFn: async () => {
      const response = await client.api.demandbydistances.$get();
      
      if (!response.ok) {
        throw new Error("Failed to fetch demandbydistances");
      }

      const result = await response.json();
      if ('error' in result) {
        throw new Error(result.error as string);
      }
      
      return result.data;
    },
  });

  return query;
};
