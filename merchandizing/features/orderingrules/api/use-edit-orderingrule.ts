import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.orderingrules[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.orderingrules[':id']['$patch']
>['json'];

export const useEditOrderingrule = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit orderingrule form', json);
      const response = await client.api.orderingrules[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Orderingrules updated');
      queryClient.invalidateQueries({ queryKey: ['orderingrule', { id }] });
      queryClient.invalidateQueries({ queryKey: ['orderingrules'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit orderingrule');
    }
  });

  return mutation;
};
