import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.vehicleselections)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.vehicleselections)[':id']['$patch']
>['json'];

export const useEditVehicleselection = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.vehicleselections[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Vehicleselections updated');
      queryClient.invalidateQueries({ queryKey: ['vehicleselection', { id }] });
      queryClient.invalidateQueries({ queryKey: ['vehicleselections'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit vehicleselection');
    }
  });

  return mutation;
};
