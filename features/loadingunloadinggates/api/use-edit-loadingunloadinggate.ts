import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  typeof client.api.loadingunloadinggates[':id']['$patch']
>;
type RequestType = InferRequestType<
  typeof client.api.loadingunloadinggates[':id']['$patch']
>['json'];

export const useEditLoadingunloadinggate = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('edit loadingunloadinggate form', json);
      const response = await client.api.loadingunloadinggates[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Loadingunloadinggates updated');
      queryClient.invalidateQueries({ queryKey: ['loadingunloadinggate', { id }] });
      queryClient.invalidateQueries({ queryKey: ['loadingunloadinggates'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit loadingunloadinggate');
    }
  });

  return mutation;
};
