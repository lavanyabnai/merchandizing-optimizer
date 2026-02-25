import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.tariffs["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.tariffs["bulk-create"]["$post"]>["json"];

export const useBulkCreateTariffs = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.tariffs["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("tariffs created");
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
    onError: () => {
      toast.error("Failed to create tariffs");
    },
  });

  return mutation;
};