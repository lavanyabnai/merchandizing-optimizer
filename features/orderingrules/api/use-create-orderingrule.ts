import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.orderingrules.$post>;
type RequestType = InferRequestType<typeof client.api.orderingrules.$post>["json"];

export const useCreateOrderingrule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`orderingrule Data: ${JSON.stringify(json)}`);
      const response = await client.api.orderingrules.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Orderingrule created");
      queryClient.invalidateQueries({ queryKey: ["orderingrules"] });
    },
    onError: () => {
      toast.error("Failed to create orderingrule");
    },
  });

  return mutation;
};
