import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetEvents = () => {
  const query = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await client.api.events.$get({
        query: {}
      });
      console.log(response, 'response');

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
