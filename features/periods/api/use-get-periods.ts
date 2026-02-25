import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetPeriods = () => {
  const query = useQuery({
    queryKey: ['periods'],
    queryFn: async () => {
      const response = await client.api.periods.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch periods');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
