import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetShippings = () => {
  const query = useQuery({
    queryKey: ['shippings'],
    queryFn: async () => {
      const response = await client.api.shipping.$get({
        query: {
          productId: undefined as string | undefined,
          timePeriodId: undefined as string | undefined,
          vehicleTypeId: undefined as string | undefined,
          facilitiesId: undefined as string | undefined
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch shippings');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
