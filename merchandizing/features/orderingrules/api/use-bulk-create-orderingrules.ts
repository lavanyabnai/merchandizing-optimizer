import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.orderingrules["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.orderingrules["bulk-create"]["$post"]>["json"];

export const useBulkCreateorderingrules = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.orderingrules["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("orderingrules created");
      queryClient.invalidateQueries({ queryKey: ["orderingrules"] });
    },
    onError: () => {
      toast.error("Failed to create orderingrules");
    },
  });

  return mutation;
};