import { useQuery } from '@tanstack/react-query';


import { client } from '@/lib/hono';


export const useGetVehicleselections = () => {
  const query = useQuery({
      queryKey: ['vehicleselections'],
      queryFn: async () => {
        const response = await client.api.vehicleselections.$get();

        if (!response.ok) {
          throw new Error('Failed to fetch vehicleselections');
        }

        const { data } = await response.json();

        return data;
      }
    });

    return query;
  };
