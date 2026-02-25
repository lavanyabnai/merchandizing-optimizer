import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.cashaccounts.$post>;
type RequestType = InferRequestType<typeof client.api.cashaccounts.$post>["json"];

export const useCreateCashaccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      try {
        console.log('Request data:', json);
        const response = await client.api.cashaccounts.$post({ 
          json: {
            ...json,
            initialCash: json.initialCash?.toString(),
            interest: json.interest?.toString()
          } 
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
      toast.success("Cashaccount created");
      queryClient.invalidateQueries({ queryKey: ["cashaccounts"] });
    },
    onError: (error) => {
      console.error('Create cash account error:', error);
      toast.error("Failed to create cashaccount");
    },
  });

  return mutation;
};
