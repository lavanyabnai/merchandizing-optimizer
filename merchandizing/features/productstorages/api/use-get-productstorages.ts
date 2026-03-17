import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetProductstorages = () => {
  const query = useQuery({
    queryKey: ['productstorages'],
    queryFn: async () => {
      const response = await client.api.productstorages.$get({
        query: {
          productId: undefined as string | undefined,
          timePeriodId: undefined as string | undefined,
          label: undefined as string | undefined,
          facilityId: undefined as string | undefined
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch productstorages');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
