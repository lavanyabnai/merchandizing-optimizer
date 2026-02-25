import { useQuery } from '@tanstack/react-query';


import { client } from '@/lib/hono';

export const useGetBomcomponents = () => {
  const query = useQuery({
    queryKey: ['bomcomponents'],
    queryFn: async () => {
      const response = await client.api.bomcomponents.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch bomcomponents');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
