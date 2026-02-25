import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetTariffs = () => {
  const query = useQuery({
    queryKey: ['tariffs'],
    queryFn: async () => {
      const response = await client.api.tariffs.$get({
        query: {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tariffs');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
