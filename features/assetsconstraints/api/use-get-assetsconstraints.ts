import { useQuery } from '@tanstack/react-query';


import { client } from '@/lib/hono';

export const useGetAssetsconstraints = () => {
  const query = useQuery({
    queryKey: ['assetsconstraints'],
    queryFn: async () => {
      const response = await client.api.assetsconstraints.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch assetsconstraints');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
