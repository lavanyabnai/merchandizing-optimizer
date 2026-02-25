import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.periodgroups)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.periodgroups)[':id']['$patch']
>['json'];

export const useEditPeriodgroup = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) {
        throw new Error('Missing periodgroup id');
      }
      console.log('jsonEdit', json);
      const response = await client.api.periodgroups[':id']['$patch']({
        param: { id: id || "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Periodgroups updated');
      queryClient.invalidateQueries({ queryKey: ['periodgroup', { id }] });
      queryClient.invalidateQueries({ queryKey: ['periodgroups'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit periodgroup');
    }
  });

  return mutation;
};
