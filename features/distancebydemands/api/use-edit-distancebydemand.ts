import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.distancebydemands)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.distancebydemands)[':id']['$patch']
>['json'];

export const useEditDistancebydemand = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (id) {
        const response = await client.api.distancebydemands[':id']['$patch']({
          param: { id },
          json
        });
        return await response.json();
      } else {
        throw new Error('ID is not provided');
      }
    },
    onSuccess: () => {
      toast.success('Distancebydemands updated');
      queryClient.invalidateQueries({ queryKey: ['distancebydemand', { id }] });
      queryClient.invalidateQueries({ queryKey: ['distancebydemands'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit distancebydemand');
    }
  });

  return mutation;
};
