import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetProduction_nos = () => {
  const query = useQuery({
    queryKey: ['production_nos'],
    queryFn: async () => {
      const response = await client.api.production_no.$get();
      console.log(response, 'response');

      if (!response.ok) {
        throw new Error('Failed to fetch production_nos');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
