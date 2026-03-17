import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.processingcosts.$post>;
type RequestType = InferRequestType<typeof client.api.processingcosts.$post>["json"];

export const useCreateProcessingcost = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`processingcost Data: ${JSON.stringify(json)}`);
      const response = await client.api.processingcosts.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Processingcost created");
      queryClient.invalidateQueries({ queryKey: ["processingcosts"] });
    },
    onError: () => {
      toast.error("Failed to create processingcost");
    },
  });

  return mutation;
};
