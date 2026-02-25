import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.unitconversions)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.unitconversions)[':id']['$patch']
>['json'];

export const useEditUnitconversion = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.unitconversions[':id']['$patch']({
        param: { id },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Unitconversions updated');
      queryClient.invalidateQueries({ queryKey: ['unitconversion', { id }] });
      queryClient.invalidateQueries({ queryKey: ['unitconversions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit unitconversion');
    }
  });

  return mutation;
};
