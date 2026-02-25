import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetDemandFulfillments = () => {
  const query = useQuery({
    queryKey: ["demandfulfillments"],
    queryFn: async () => {
      const response = await client.api.demandfulfillments.$get();
      // const response = await fetch('/api/demandbydistances', {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });

      const jsonResponse = await response.json();

      if ('error' in jsonResponse) {
        // If the response JSON contains an error property, throw an error.
        // This will be caught by React Query and set the query's error state.
        throw new Error(jsonResponse.error);
      }

      // If there's no 'error' property, TypeScript infers that jsonResponse
      // must be of the type { data: ... }, so accessing .data is safe.
      return jsonResponse.data;
    },
  });

  return query;
};