import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.paymentterms["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.paymentterms["bulk-create"]["$post"]>["json"];

export const useBulkCreatePaymentterms = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log(`bulk create paymentterms`, json);
      const response = await client.api.paymentterms['bulk-create']['$post']({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Paymentterms created');
      queryClient.invalidateQueries({ queryKey: ['paymentterms'] });
    },
    onError: () => {
      toast.error('Failed to create paymentterms');
    }
  });

  return mutation;
};
