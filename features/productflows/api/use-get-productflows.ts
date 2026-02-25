import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetProductflows = () => {
  const query = useQuery({
    queryKey: ['productflows'],
    queryFn: async () => {
      const response = await client.api.productflows.$get({
        query: {
          productId: undefined as string | undefined,
          timePeriodId: undefined as string | undefined
        }
      });
      console.log(response, 'response');

      if (!response.ok) {
        throw new Error('Failed to fetch productflows');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
