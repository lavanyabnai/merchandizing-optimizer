import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.demandforecasts[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.demandforecasts[':id']['$patch']
>['json'];

export const useEditDemandforecast = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit demandforecast form', json);
      const response = await client.api.demandforecasts[':id']['$patch']({
        param: { id: id as string },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Demandforecasts updated');
      queryClient.invalidateQueries({ queryKey: ['demandforecast', { id }] });
      queryClient.invalidateQueries({ queryKey: ['demandforecasts'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit demandforecast');
    }
  });

  return mutation;
};
