import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.linearranges)['bulk-create']['$post']
>;
type RequestType = InferRequestType<
  (typeof client.api.linearranges)['bulk-create']['$post']
>['json'];

export const useBulkCreateLinearranges = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log(`bulk create linearranges`, json);
      const formattedJson = json.map((linearrange) => ({
        ...linearrange,
        lowerBound: linearrange.lowerBound
          ? parseInt(linearrange.lowerBound as unknown as string)
          : undefined,
        upperBound: linearrange.upperBound
          ? parseInt(linearrange.upperBound as unknown as string)
          : undefined
      }));
      console.log(`formattedJson`, formattedJson);
      const response = await client.api.linearranges['bulk-create']['$post']({
        json: formattedJson.map(linearrange => ({
          ...linearrange,
          lowerBound: linearrange.lowerBound ? linearrange.lowerBound.toString() : '',
          upperBound: linearrange.upperBound ? linearrange.upperBound.toString() : ''
        }))
      });

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Linearranges created');
      queryClient.invalidateQueries({ queryKey: ['linearranges'] });
    },
    onError: () => {
      toast.error('Failed to create linearranges');
    }
  });

  return mutation;
};
