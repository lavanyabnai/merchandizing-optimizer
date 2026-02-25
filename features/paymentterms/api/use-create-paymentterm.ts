import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.paymentterms.$post>;
type RequestType = InferRequestType<typeof client.api.paymentterms.$post>["json"];

export const useCreatePaymentterm = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      try {
        console.log('Request data:', json);
        const response = await client.api.paymentterms.$post({ 
          json 
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error('Failed to create cash account');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Create cash account error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Paymentterm created");
      queryClient.invalidateQueries({ queryKey: ["paymentterms"] });
    },
    onError: (error) => {
      console.error('Create cash account error:', error);
      toast.error("Failed to create paymentterm");
    },
  });

  return mutation;
};
