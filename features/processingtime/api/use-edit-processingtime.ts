import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.processingtime[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.processingtime[':id']['$patch']
>['json'];

export const useEditProcessingtime = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit processingtime form', json);
      const response = await client.api.processingtime[':id']['$patch']({
        param: { id: id || "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Processingtimes updated');
      queryClient.invalidateQueries({ queryKey: ['processingtime', { id }] });
      queryClient.invalidateQueries({ queryKey: ['processingtimes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit processingtime');
    }
  });

  return mutation;
};
