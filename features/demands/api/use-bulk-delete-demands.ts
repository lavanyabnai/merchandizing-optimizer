import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.demands["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.demands["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteDemands = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.demands["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Demands deleted");
      queryClient.invalidateQueries({ queryKey: ["demands"] });
    },
    onError: () => {
      toast.error("Failed to delete demands");
    },
  });

  return mutation;
};
