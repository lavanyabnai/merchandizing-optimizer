import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.milkruns[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.milkruns[':id']['$patch']
>['json'];

export const useEditMilkrun = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit milkrun form', json);
      const response = await client.api.milkruns[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Milkruns updated');
      queryClient.invalidateQueries({ queryKey: ['milkrun', { id }] });
      queryClient.invalidateQueries({ queryKey: ['milkruns'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit milkrun');
    }
  });

  return mutation;
};
