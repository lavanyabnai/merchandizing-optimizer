import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTimewindow = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["timewindow", { id }],
    queryFn: async () => {
      const response = await client.api.timewindows[":id"].$get({
        param: { id: id ?? "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch timewindow");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
