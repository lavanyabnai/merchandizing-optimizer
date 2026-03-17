import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetTimewindows = () => {
  const query = useQuery({
    queryKey: ['timewindows'],
    queryFn: async () => {
      const response = await client.api.timewindows.$get({
        query: {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timewindows');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
