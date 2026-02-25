import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.objectivemembers)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.objectivemembers)[':id']['$patch']
>['json'];

export const useEditobjectivemember = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.objectivemembers[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('customconstraints updated');
      queryClient.invalidateQueries({ queryKey: ['objectivemember', { id }] });
      queryClient.invalidateQueries({ queryKey: ['objectivemembers'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit objectivemember');
    }
  });

  return mutation;
};
