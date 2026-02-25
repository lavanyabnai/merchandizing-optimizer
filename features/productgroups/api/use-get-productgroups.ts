import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetProductgroups = () => {
  const query = useQuery({
    queryKey: ['productgroups'],
    queryFn: async () => {
      const response = await client.api.productgroups.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch productgroups');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
