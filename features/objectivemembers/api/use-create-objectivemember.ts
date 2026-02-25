import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.objectivemembers.$post>;
type RequestType = InferRequestType<typeof client.api.objectivemembers.$post>['json'];

export const useCreateobjectivemember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.objectivemembers.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('objectivemembers created');
      queryClient.invalidateQueries({ queryKey: ['objectivemembers'] });
    },
    onError: () => {
      toast.error('Failed to create objectivemembers');
    }
  });

  return mutation;
};
