import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.customers)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.customers)[':id']['$patch']
>['json'];

export const useEditCustomer = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      
      const response = await client.api.customers[':id']['$patch']({
        param: { id: id as string },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Customers updated');
      queryClient.invalidateQueries({ queryKey: ['customer', { id }] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit customer');
    }
  });

  return mutation;
};
