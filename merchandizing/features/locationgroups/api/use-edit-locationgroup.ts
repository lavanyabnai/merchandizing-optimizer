import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.locationgroups)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.locationgroups)[':id']['$patch']
>['json'];

export const useEditLocationgroup = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('jsonEdit', json);
      const response = await client.api.locationgroups[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Locationgroups updated');
      queryClient.invalidateQueries({ queryKey: ['locationgroup', { id }] });
      queryClient.invalidateQueries({ queryKey: ['locationgroups'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit locationgroup');
    }
  });

  return mutation;
};
