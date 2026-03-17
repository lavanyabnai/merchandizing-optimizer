import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productstorages["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.productstorages["bulk-create"]["$post"]>["json"];

export const useBulkCreateproductstorages = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.productstorages["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("productstorages created");
      queryClient.invalidateQueries({ queryKey: ["productstorages"] });
    },
    onError: () => {
      toast.error("Failed to create productstorages");
    },
  });

  return mutation;
};