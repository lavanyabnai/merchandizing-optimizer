import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.paths[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.paths[':id']['$patch']
>['json'];

export const useEditPath = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit path form', json);
      const response = await client.api.paths[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Paths updated');
      queryClient.invalidateQueries({ queryKey: ['path', { id }] });
      queryClient.invalidateQueries({ queryKey: ['paths'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit path');
    }
  });

  return mutation;
};
