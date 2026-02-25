import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.processingcosts["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.processingcosts["bulk-create"]["$post"]>["json"];

export const useBulkCreateprocessingcosts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.processingcosts["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("processingcosts created");
      queryClient.invalidateQueries({ queryKey: ["processingcosts"] });
    },
    onError: () => {
      toast.error("Failed to create processingcosts");
    },
  });

  return mutation;
};