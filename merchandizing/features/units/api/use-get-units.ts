import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetUnits = () => {
  const query = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const response = await client.api.units.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch units');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
