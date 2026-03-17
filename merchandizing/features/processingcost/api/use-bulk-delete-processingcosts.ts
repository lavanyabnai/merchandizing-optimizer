import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.processingcosts["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.processingcosts["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteprocessingcosts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.processingcosts["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("processingcosts deleted");
      queryClient.invalidateQueries({ queryKey: ["processingcosts"] });
    },
    onError: () => {
      toast.error("Failed to delete processingcosts");
    },
  });

  return mutation;
};
