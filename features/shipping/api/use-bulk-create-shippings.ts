import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.shipping["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.shipping["bulk-create"]["$post"]>["json"];

export const useBulkCreateshippings = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.shipping["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("shippings created");
      queryClient.invalidateQueries({ queryKey: ["shippings"] });
    },
    onError: () => {
      toast.error("Failed to create shippings");
    },
  });

  return mutation;
};