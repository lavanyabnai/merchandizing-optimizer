import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.factories)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.factories)[':id']['$patch']
>['json'];

export const useEditFactory = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('jsonEdit', json);
      const response = await client.api.factories[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Factories updated');
      queryClient.invalidateQueries({ queryKey: ['factory', { id }] });
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit factory');
    }
  });

  return mutation;
};
