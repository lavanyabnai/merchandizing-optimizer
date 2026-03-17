import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.productstorages[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.productstorages[':id']['$patch']
>['json'];

export const useEditProductstorage = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit productstorage form', json);
      const response = await client.api.productstorages[':id']['$patch']({
        param: { id: id || "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Productstorages updated');
      queryClient.invalidateQueries({ queryKey: ['productstorage', { id }] });
      queryClient.invalidateQueries({ queryKey: ['productstorages'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit productstorage');
    }
  });

  return mutation;
};
