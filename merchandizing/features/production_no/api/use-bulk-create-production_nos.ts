import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.production_no["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.production_no["bulk-create"]["$post"]>["json"];

  export const useBulkCreateproduction_nos = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.production_no["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("production_nos created");
      queryClient.invalidateQueries({ queryKey: ["production_nos"] });
    },
    onError: () => {
      toast.error("Failed to create production_nos");
    },
  });

  return mutation;
};