import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.net_scenarios)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.net_scenarios)[':id']['$patch']
>['json'];

export const useEditNetScenario = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log('jsonEdit', json);
      const response = await client.api.net_scenarios[':id']['$patch']({
        param: { id: id ?? "" },
        json
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Net scenarios updated');
      queryClient.invalidateQueries({ queryKey: ['net_scenario', { id }] });
      queryClient.invalidateQueries({ queryKey: ['net_scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to edit net scenario');
    }
  });

  return mutation;
};
