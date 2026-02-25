import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetcoglocation = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["coglocation", { id }],
    queryFn: async () => {
      const response = await client.api.coglocations[":id"].$get({
        param: { id: id as string },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch coglocation");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
