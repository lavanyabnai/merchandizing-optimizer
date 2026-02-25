import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.timewindows[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.timewindows[':id']['$patch']
>['json'];

export const useEditTimewindow = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      if (!id) throw new Error('ID is required');
      const response = await client.api.timewindows[':id']['$patch']({
        param: { id: id ?? '' },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Timewindows updated');
      queryClient.invalidateQueries({ queryKey: ['timewindow', { id }] });
      queryClient.invalidateQueries({ queryKey: ['timewindows'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit timewindow');
    }
  });

  return mutation;
};
