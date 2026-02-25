import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetProcessingcosts = () => {
  const query = useQuery({
    queryKey: ['processingcosts'],
    queryFn: async () => {
      const response = await client.api.processingcosts.$get({
        query: {
          productId: undefined as string | undefined,
          timePeriodId: undefined as string | undefined,
          facilityId: undefined as string | undefined
        }
      });
      console.log(response, 'response');

      if (!response.ok) {
        throw new Error('Failed to fetch processingcosts');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
