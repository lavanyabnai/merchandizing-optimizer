import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetLocationgroups = () => {
  const query = useQuery({
    queryKey: ['locationgroups'],
    queryFn: async () => {
      const response = await client.api.locationgroups.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch locationgroups');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
