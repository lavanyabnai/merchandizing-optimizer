import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetobjectivemembers = () => {
  const query = useQuery({
    queryKey: ['objectivemembers'],
    queryFn: async () => {
      const response = await client.api.objectivemembers.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch objectivemembers');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
