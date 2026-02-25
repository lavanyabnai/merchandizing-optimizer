import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.distancebydemands)['bulk-create']['$post']
>;
type RequestType = InferRequestType<
  (typeof client.api.distancebydemands)['bulk-create']['$post']
>['json'];

export const useBulkCreateDistancebydemands = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log(`bulk create distancebydemands`, json);
      const response = await client.api.distancebydemands['bulk-create'][
        '$post'
      ]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('distancebydemands created');
      queryClient.invalidateQueries({ queryKey: ['distancebydemands'] });
    },
    onError: () => {
      toast.error('Failed to create distancebydemands');
    }
  });

  return mutation;
};
