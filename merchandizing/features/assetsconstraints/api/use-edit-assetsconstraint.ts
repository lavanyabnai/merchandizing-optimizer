import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.assetsconstraints)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.assetsconstraints)[':id']['$patch']
>['json'];

export const useEditAssetsconstraint = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.assetsconstraints[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Assetsconstraints updated');
      queryClient.invalidateQueries({ queryKey: ['assetsconstraint', { id }] });
      queryClient.invalidateQueries({ queryKey: ['assetsconstraints'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit assetsconstraint');
    }
  });

  return mutation;
};
