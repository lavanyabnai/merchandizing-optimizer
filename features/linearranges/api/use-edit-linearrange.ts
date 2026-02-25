import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.linearranges)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.linearranges)[':id']['$patch']
>['json'];

export const useEditLinearrange = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('jsonEdit', json);
      const response = await client.api.linearranges[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Linearranges updated');
      queryClient.invalidateQueries({ queryKey: ['linearrange', { id }] });
      queryClient.invalidateQueries({ queryKey: ['linearranges'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit linearrange');
    }
  });

  return mutation;
};
