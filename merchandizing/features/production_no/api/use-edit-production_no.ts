import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.production_no[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.production_no[':id']['$patch']
>['json'];

export const useEditProduction_no = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit production_no form', json);
      const response = await client.api.production_no[':id']['$patch']({
        param: { id: id || "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Production_nos updated');
      queryClient.invalidateQueries({ queryKey: ['production_no', { id }] });
      queryClient.invalidateQueries({ queryKey: ['production_nos'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit production_no');
    }
  });

  return mutation;
};
