import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.cashaccounts["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.cashaccounts["bulk-create"]["$post"]>["json"];

export const useBulkCreateCashaccounts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log(`bulk create cashaccounts`, json);
      const response = await client.api.cashaccounts['bulk-create']['$post']({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Cashaccounts created');
      queryClient.invalidateQueries({ queryKey: ['cashaccounts'] });
    },
    onError: () => {
      toast.error('Failed to create cashaccounts');
    }
  });

  return mutation;
};
