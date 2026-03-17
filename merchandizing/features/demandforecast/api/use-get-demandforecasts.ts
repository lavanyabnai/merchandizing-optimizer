import { useQuery } from '@tanstack/react-query';


import { client } from '@/lib/hono';

export const useGetDemandforecasts = () => {
  const query = useQuery({
    queryKey: ['demandforecasts'],
    queryFn: async () => {
      const response = await client.api.demandforecasts.$get();
      console.log(response, 'response');

      if (!response.ok) {
        throw new Error('Failed to fetch demandforecasts');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
