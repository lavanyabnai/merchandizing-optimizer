import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.demands["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.demands["bulk-create"]["$post"]>["json"];

export const useBulkCreateDemands = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.demands["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Demands created");
      queryClient.invalidateQueries({ queryKey: ["demands"] });
    },
    onError: () => {
      toast.error("Failed to create demands");
    },
  });

  return mutation;
};