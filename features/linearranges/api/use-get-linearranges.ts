import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetLinearranges = () => {
  const query = useQuery({
    queryKey: ['linearranges'],
    queryFn: async () => {
      const response = await client.api.linearranges.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch linearranges');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
