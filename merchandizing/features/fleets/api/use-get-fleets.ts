import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetFleets = () => {
  const query = useQuery({
    queryKey: ['fleets'],
    queryFn: async () => {
      const response = await client.api.fleets.$get({
        query: {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fleets');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
