import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetVehicleTypes = () => {
  const query = useQuery({
    queryKey: ['vehicleTypes'],
    queryFn: async () => {
      const response = await client.api.vehicleTypes.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch vehicleTypes');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
