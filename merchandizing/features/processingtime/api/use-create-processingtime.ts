import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.processingtime.$post>;
type RequestType = InferRequestType<typeof client.api.processingtime.$post>["json"];

export const useCreateProcessingtime = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`processingtime Data: ${JSON.stringify(json)}`);
      const response = await client.api.processingtime.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Processingtime created");
      queryClient.invalidateQueries({ queryKey: ["processingtimes"] });
    },
    onError: () => {
      toast.error("Failed to create processingtime");
    },
  });

  return mutation;
};
