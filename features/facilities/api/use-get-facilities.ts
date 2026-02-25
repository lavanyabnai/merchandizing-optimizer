import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetFacilities = () => {
  const query = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const response = await client.api.facilities.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
