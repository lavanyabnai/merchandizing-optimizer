import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.suppliers)['bulk-create']['$post']
>;
type RequestType = InferRequestType<
  (typeof client.api.suppliers)['bulk-create']['$post']
>['json'];

export const useBulkCreateSuppliers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log(`bulk create suppliers`, json);
      const response = await client.api.suppliers['bulk-create']['$post']({ json });

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Suppliers created');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: () => {
      toast.error('Failed to create suppliers');
    }
  });

  return mutation;
};
