import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.inventorys)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.inventorys)[':id']['$patch']
>['json'];

export const useEditInventory = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.inventorys[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Inventorys updated');
      queryClient.invalidateQueries({ queryKey: ['inventory', { id }] });
      queryClient.invalidateQueries({ queryKey: ['inventorys'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit inventory');
    }
  });

  return mutation;
};
