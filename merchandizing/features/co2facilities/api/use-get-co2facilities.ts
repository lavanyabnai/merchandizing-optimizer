import { useQuery } from '@tanstack/react-query';


import { client } from '@/lib/hono';

export const useGetCo2facilities = () => {
  const query = useQuery({
    queryKey: ['co2facilities'],
    queryFn: async () => {
      const response = await client.api.co2facilities.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch co2facilities');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
