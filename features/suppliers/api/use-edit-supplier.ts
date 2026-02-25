import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.suppliers)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.suppliers)[':id']['$patch']
>['json'];

export const useEditSupplier = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      
      const response = await client.api.suppliers[':id']['$patch']({
        param: { id: id ?? '' },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Suppliers updated');
      queryClient.invalidateQueries({ queryKey: ['supplier', { id }] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit supplier');
    }
  });

  return mutation;
};
