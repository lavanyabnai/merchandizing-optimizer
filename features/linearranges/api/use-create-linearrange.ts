import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.linearranges.$post>;
type RequestType = InferRequestType<
  typeof client.api.linearranges.$post
>['json'];

export const useCreateLinearrange = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('json', json);
      const response = await client.api.linearranges.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('linearrange created');
      queryClient.invalidateQueries({ queryKey: ['linearranges'] });
    },
    onError: () => {
      toast.error('Failed to create linearrange');
    }
  });

  return mutation;
};
