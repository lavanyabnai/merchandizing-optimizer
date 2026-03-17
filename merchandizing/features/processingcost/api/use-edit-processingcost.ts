import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.processingcosts[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.processingcosts[':id']['$patch']
>['json'];

export const useEditProcessingcost = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit processingcost form', json);
      const response = await client.api.processingcosts[':id']['$patch']({
        param: { id: id || "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Processingcosts updated');
      queryClient.invalidateQueries({ queryKey: ['processingcost', { id }] });
      queryClient.invalidateQueries({ queryKey: ['processingcosts'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit processingcost');
    }
  });

  return mutation;
};
