import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetSourcings = () => {
  const query = useQuery({
    queryKey: ['sourcings'],
    queryFn: async () => {
      const response = await client.api.sourcing.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch sourcings');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
