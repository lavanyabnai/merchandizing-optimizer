import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.co2processing)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.co2processing)[':id']['$patch']
>['json'];

export const useEditCo2processing = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      
      const response = await client.api.co2processing[':id']['$patch']({
        param: { id: id as string },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Co2processings updated');
      queryClient.invalidateQueries({ queryKey: ['co2processing', { id }] });
      queryClient.invalidateQueries({ queryKey: ['co2processings'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit co2processing');
    }
  });

  return mutation;
};
