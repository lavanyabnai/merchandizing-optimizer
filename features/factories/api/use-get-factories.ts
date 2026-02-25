import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetFactories = () => {
  const query = useQuery({
    queryKey: ['factories'],
    queryFn: async () => {
      const response = await client.api.factories.$get({
        query: {
          // your query parameters here
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch factories');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
