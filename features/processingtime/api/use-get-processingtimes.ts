import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetProcessingtimes = () => {
  const query = useQuery({
    queryKey: ['processingtimes'],
    queryFn: async () => {
      const response = await client.api.processingtime.$get({
        query: {
          productId: undefined as string | undefined,
          facilityId: undefined as string | undefined
        }
      });
      console.log(response, 'response');

      if (!response.ok) {
        throw new Error('Failed to fetch processingtimes');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
