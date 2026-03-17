import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.salesbatches)['bulk-create']['$post']
>;
type RequestType = InferRequestType<
  (typeof client.api.salesbatches)['bulk-create']['$post']
>['json'];

export const useBulkCreateSalesbatches = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log(`bulk create salesbatches`, json);
      const response = await client.api.salesbatches['bulk-create']['$post']({
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Salesbatches created');
      queryClient.invalidateQueries({ queryKey: ['salesbatches'] });
    },
    onError: () => {
      toast.error('Failed to create salesbatches');
    }
  });

  return mutation;
};
