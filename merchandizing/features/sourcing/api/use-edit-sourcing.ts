import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.sourcing[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.sourcing[':id']['$patch']
>['json'];

export const useEditSourcing = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit sourcing form', json);
      const response = await client.api.sourcing[':id']['$patch']({
        param: { id: id || "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Sourcings updated');
      queryClient.invalidateQueries({ queryKey: ['sourcing', { id }] });
      queryClient.invalidateQueries({ queryKey: ['sourcings'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit sourcing');
    }
  });

  return mutation;
};
