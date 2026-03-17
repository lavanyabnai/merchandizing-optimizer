import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetIndicatorconstraint = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['indicatorconstraint', { id }],
    queryFn: async () => {
      const response = await client.api.indicatorconstraints[':id'].$get({
        param: { id: id ?? "" }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch distancebydemand');
      }

      const { data } = await response.json();
      return data;
    }
  });

  return query;
};
