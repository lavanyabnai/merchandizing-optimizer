import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetInventorys = () => {
  const query = useQuery({
    queryKey: ['inventorys'],
    queryFn: async () => {
      const response = await client.api.inventorys.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch inventorys');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
