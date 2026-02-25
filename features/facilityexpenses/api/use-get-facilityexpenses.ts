import { useQuery } from '@tanstack/react-query';


import { client } from '@/lib/hono';

export const useGetFacilityexpenses = () => {
  const query = useQuery({
    queryKey: ['facilityexpenses'],
    queryFn: async () => {
      const response = await client.api.facilityexpenses.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch facilityexpenses');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
