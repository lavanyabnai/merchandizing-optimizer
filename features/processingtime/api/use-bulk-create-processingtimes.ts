import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.processingtime["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.processingtime["bulk-create"]["$post"]>["json"];

export const useBulkCreateprocessingtimes = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.processingtime["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("processingtimes created");
      queryClient.invalidateQueries({ queryKey: ["processingtimes"] });
    },
    onError: () => {
      toast.error("Failed to create processingtimes");
    },
  });

  return mutation;
};