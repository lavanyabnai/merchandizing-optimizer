import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetNetScenarios = () => {
  const query = useQuery({
    queryKey: ['net_scenarios'],
    queryFn: async () => {
      const response = await client.api.net_scenarios.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch net_scenarios');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
