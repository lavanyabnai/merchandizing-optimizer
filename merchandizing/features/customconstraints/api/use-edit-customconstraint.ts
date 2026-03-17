import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.customconstraints)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.customconstraints)[':id']['$patch']
>['json'];

export const useEditcustomconstraint = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.customconstraints[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('customconstraints updated');
      queryClient.invalidateQueries({ queryKey: ['customconstraint', { id }] });
      queryClient.invalidateQueries({ queryKey: ['customconstraints'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit customconstraint');
    }
  });

  return mutation;
};
