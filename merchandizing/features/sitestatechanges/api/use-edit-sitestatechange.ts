import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.sitestatechanges[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.sitestatechanges[':id']['$patch']
>['json'];

export const useEditSitestatechange = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit sitestatechange form', json);
      const response = await client.api.sitestatechanges[':id']['$patch']({
        param: { id: id || "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Sitestatechanges updated');
      queryClient.invalidateQueries({ queryKey: ['sitestatechange', { id }] });
      queryClient.invalidateQueries({ queryKey: ['sitestatechanges'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit sitestatechange');
    }
  });

  return mutation;
};
