import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.salesbatches.$post>;
type RequestType = InferRequestType<typeof client.api.salesbatches.$post>["json"];

export const useCreateSalesbatche = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
   

      const response = await client.api.salesbatches.$post({ json });
      return await response.json();
    },

    onSuccess: () => {
      toast.success('Salesbatche created');
      queryClient.invalidateQueries({ queryKey: ['salesbatches'] });
    },
    onError: () => {
      toast.error('Failed to create salesbatche');
    }
  });

  return mutation;
};
