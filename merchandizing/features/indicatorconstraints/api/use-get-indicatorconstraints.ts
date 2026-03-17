import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetIndicatorconstraints = () => {
  const query = useQuery({
    queryKey: ['indicatorconstraints'],
    queryFn: async () => {
      const response = await client.api.indicatorconstraints.$get();


      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }

      const { data } = await response.json();
      return data;
    }
  });

  return query;
};
