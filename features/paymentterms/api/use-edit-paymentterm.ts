import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.paymentterms)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.paymentterms)[':id']['$patch']
>['json'];

export const useEditPaymentterm = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      
      const response = await client.api.paymentterms[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Paymentterms updated');
      queryClient.invalidateQueries({ queryKey: ['paymentterm', { id }] });
      queryClient.invalidateQueries({ queryKey: ['paymentterms'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit paymentterm');
    }
  });

  return mutation;
};
