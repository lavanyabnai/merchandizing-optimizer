import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.demands[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.demands[':id']['$patch']
>['json'];

export const useEditDemand = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit demand form', json);
      const response = await client.api.demands[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Demands updated');
      queryClient.invalidateQueries({ queryKey: ['demand', { id }] });
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit demand');
    }
  });

  return mutation;
};
