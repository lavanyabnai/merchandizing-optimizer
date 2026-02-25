import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.bomcomponents)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.bomcomponents)[':id']['$patch']
>['json'];

export const useEditBomcomponent = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) {
        throw new Error('ID is required');
      }
      
      const response = await client.api.bomcomponents[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Bomcomponents updated');
      queryClient.invalidateQueries({ queryKey: ['bomcomponent', { id }] });
      queryClient.invalidateQueries({ queryKey: ['bomcomponents'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit facility');
    }
  });

  return mutation;
};
