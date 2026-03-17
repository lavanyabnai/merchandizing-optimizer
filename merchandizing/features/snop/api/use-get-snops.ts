import { useQuery } from '@tanstack/react-query';


import { client } from '@/lib/hono';

export const useGetSnops = () => {
  const query = useQuery({
    queryKey: ['snops'],
    queryFn: async () => {
      const response = await client.api.snops.$get({
        query: {
          sourceId: '1',
          productId: '1',
          timePeriodId: '1'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch snops');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
