import { useQuery } from '@tanstack/react-query';


import { client } from '@/lib/hono';

export const useGetDemands = () => {
  const query = useQuery({
    queryKey: ['demands'],
    queryFn: async () => {
      const response = await client.api.demands.$get({
        query: {}
      });
      console.log(response, 'response');

      if (!response.ok) {
        throw new Error('Failed to fetch demands');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
