import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetcoglocations = () => {
  const query = useQuery({
    queryKey: ["coglocations"],
    queryFn: async () => {
      const response = await client.api.coglocations.$get();
      
      if (!response.ok) {
        throw new Error("Failed to fetch coglocations");
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
