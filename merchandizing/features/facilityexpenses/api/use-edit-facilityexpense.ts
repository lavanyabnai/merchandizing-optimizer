import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.facilityexpenses)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.facilityexpenses)[':id']['$patch']
>['json'];

export const useEditFacilityexpense = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      
      const response = await client.api.facilityexpenses[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Facilityexpenses updated');
      queryClient.invalidateQueries({ queryKey: ['facilityexpense', { id }] });
      queryClient.invalidateQueries({ queryKey: ['facilityexpenses'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit facilityexpense');
    }
  });

  return mutation;
};
