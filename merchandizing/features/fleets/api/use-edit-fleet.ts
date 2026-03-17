import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.fleets[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.fleets[':id']['$patch']
>['json'];

export const useEditFleet = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit fleet form', json);
      const response = await client.api.fleets[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Fleets updated');
      queryClient.invalidateQueries({ queryKey: ['fleet', { id }] });
      queryClient.invalidateQueries({ queryKey: ['fleets'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit fleet');
    }
  });

  return mutation;
};
