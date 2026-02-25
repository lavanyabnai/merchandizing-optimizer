import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.indicatorconstraints.$post
>;
type RequestType = InferRequestType<
  typeof client.api.indicatorconstraints.$post
>['json'];

export const useCreateIndicatorconstraint = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.indicatorconstraints.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Indicatorconstraint created');
      queryClient.invalidateQueries({ queryKey: ['indicatorconstraints'] });
    },
    onError: () => {
      toast.error('Failed to create indicatorconstraint');
    }
  });

  return mutation;
};
