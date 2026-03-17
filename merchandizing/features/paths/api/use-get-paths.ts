import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetPaths = () => {
  const query = useQuery({
    queryKey: ['paths'],
    queryFn: async () => {
      const response = await client.api.paths.$get({
        query: {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch paths');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
