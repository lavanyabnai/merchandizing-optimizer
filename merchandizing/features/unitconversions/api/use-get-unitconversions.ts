import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetUnitconversions = () => {
  const query = useQuery({
    queryKey: ['unitconversions'],
    queryFn: async () => {
      const response = await client.api.unitconversions.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch unitconversions');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
