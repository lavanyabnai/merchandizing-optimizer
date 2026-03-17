import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetSitestatechanges = () => {
  const query = useQuery({
    queryKey: ['sitestatechanges'],
    queryFn: async () => {
      const response = await client.api.sitestatechanges.$get();
      console.log(response, 'response');

      if (!response.ok) {
        throw new Error('Failed to fetch sitestatechanges');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
