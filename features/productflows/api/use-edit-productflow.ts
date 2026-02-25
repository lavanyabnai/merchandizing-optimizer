import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.productflows)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.productflows)[':id']['$patch']
>['json'];

export const useEditProductflow = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.productflows[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Productflows updated');
      queryClient.invalidateQueries({ queryKey: ['productflow', { id }] });
      queryClient.invalidateQueries({ queryKey: ['productflows'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit productflow');
    }
  });

  return mutation;
};
