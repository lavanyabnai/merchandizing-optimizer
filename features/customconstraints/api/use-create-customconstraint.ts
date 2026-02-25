import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.customconstraints.$post>;
type RequestType = InferRequestType<typeof client.api.customconstraints.$post>['json'];

export const useCreatecustomconstraints = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.customconstraints.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('customconstraints created');
      queryClient.invalidateQueries({ queryKey: ['customconstraints'] });
    },
    onError: () => {
      toast.error('Failed to create customconstraints');
    }
  });

  return mutation;
};
