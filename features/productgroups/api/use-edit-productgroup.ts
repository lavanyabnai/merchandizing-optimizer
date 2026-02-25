import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.productgroups)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.productgroups)[':id']['$patch']
>['json'];

export const useEditProductgroup = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('jsonEdit', json);
      const response = await client.api.productgroups[':id']['$patch']({
        param: { id: id || "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Productgroups updated');
      queryClient.invalidateQueries({ queryKey: ['productgroup', { id }] });
      queryClient.invalidateQueries({ queryKey: ['productgroups'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit productgroup');
    }
  });

  return mutation;
};
