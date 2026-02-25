import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.indicatorconstraints)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.indicatorconstraints)[':id']['$patch']
>['json'];

export const useEditIndicatorconstraint = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.indicatorconstraints[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Indicatorconstraints updated');
      queryClient.invalidateQueries({ queryKey: ['indicatorconstraint', { id }] });
      queryClient.invalidateQueries({ queryKey: ['indicatorconstraints'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit indicatorconstraint');
    }
  });

  return mutation;
};
