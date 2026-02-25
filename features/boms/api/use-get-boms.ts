import { useQuery } from '@tanstack/react-query';


import { client } from '@/lib/hono';

export const useGetBoms = () => {
  const query = useQuery({
    queryKey: ['boms'],
    queryFn: async () => {
      const response = await client.api.boms.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch boms');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
