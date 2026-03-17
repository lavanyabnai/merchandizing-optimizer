import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.boms["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.boms["bulk-create"]["$post"]>["json"];

export const useBulkCreateBoms = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log(`bulk create boms`, json);
      const response = await client.api.boms['bulk-create']['$post']({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Boms created');
      queryClient.invalidateQueries({ queryKey: ['boms'] });
    },
    onError: () => {
      toast.error('Failed to create boms');
    }
  });

  return mutation;
};
