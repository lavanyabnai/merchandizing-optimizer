import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.salesbatches)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.salesbatches)[':id']['$patch']
>['json'];

export const useEditSalesbatche = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.salesbatches[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Salesbatches updated');
      queryClient.invalidateQueries({ queryKey: ['salesbatche', { id }] });
      queryClient.invalidateQueries({ queryKey: ['salesbatches'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit salesbatche');
    }
  });

  return mutation;
};
