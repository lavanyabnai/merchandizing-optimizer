import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.periods)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.periods)[':id']['$patch']
>['json'];

export const useEditPeriod = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('jsonEdit', json);
      const response = await client.api.periods[':id']['$patch']({
        param: { id: id || "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Periods updated');
      queryClient.invalidateQueries({ queryKey: ['period', { id }] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit period');
    }
  });

  return mutation;
};
