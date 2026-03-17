import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.demandforecasts["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.demandforecasts["bulk-create"]["$post"]>["json"];

export const useBulkCreatedemandforecasts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.demandforecasts["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("demandforecasts created");
      queryClient.invalidateQueries({ queryKey: ["demandforecasts"] });
    },
    onError: () => {
      toast.error("Failed to create demandforecasts");
    },
  });

  return mutation;
};