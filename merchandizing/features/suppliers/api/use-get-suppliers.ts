import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetSuppliers = () => {
  const query = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await client.api.suppliers.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
