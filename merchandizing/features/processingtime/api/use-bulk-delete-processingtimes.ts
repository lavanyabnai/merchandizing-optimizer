import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.processingtime["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.processingtime["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteprocessingtimes = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.processingtime["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("processingtimes deleted");
      queryClient.invalidateQueries({ queryKey: ["processingtimes"] });
    },
    onError: () => {
      toast.error("Failed to delete processingtimes");
    },
  });

  return mutation;
};
