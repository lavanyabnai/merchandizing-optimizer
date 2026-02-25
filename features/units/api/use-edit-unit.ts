import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.units)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.units)[':id']['$patch']
>['json'];

export const useEditUnit = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('jsonEdit', json);
      const response = await client.api.units[':id']['$patch']({
        param: { id: id ?? '' },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Units updated');
      queryClient.invalidateQueries({ queryKey: ['unit', { id }] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit unit');
    }
  });

  return mutation;
};
