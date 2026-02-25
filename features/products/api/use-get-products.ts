import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetProducts = () => {
  const query = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await client.api.products.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
