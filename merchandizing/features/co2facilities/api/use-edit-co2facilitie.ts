import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.co2facilities)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.co2facilities)[':id']['$patch']
>['json'];

export const useEditCo2facilitie = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      
      const response = await client.api.co2facilities[':id']['$patch']({
        param: { id: id as string },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Co2facilities updated');
      queryClient.invalidateQueries({ queryKey: ['co2facilitie', { id }] });
      queryClient.invalidateQueries({ queryKey: ['co2facilities'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit co2facilitie');
    }
  });

  return mutation;
};
