import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.paths["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.paths["bulk-delete"]["$post"]>["json"];

export const useBulkDeletepaths = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.paths["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("paths deleted");
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
    onError: () => {
      toast.error("Failed to delete paths");
    },
  });

  return mutation;
};
