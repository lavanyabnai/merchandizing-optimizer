import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.tariffs[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.tariffs[':id']['$patch']
>['json'];

export const useEditTariff = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit tariff form', json);
      const response = await client.api.tariffs[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Tariffs updated');
      queryClient.invalidateQueries({ queryKey: ['tariff', { id }] });
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit tariff');
    }
  });

  return mutation;
};
