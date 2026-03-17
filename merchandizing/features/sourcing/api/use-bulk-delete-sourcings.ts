import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.sourcing["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.sourcing["bulk-delete"]["$post"]>["json"];

export const useBulkDeletesourcings = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.sourcing["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("sourcings deleted");
      queryClient.invalidateQueries({ queryKey: ["sourcings"] });
    },
    onError: () => {
      toast.error("Failed to delete sourcings");
    },
  });

  return mutation;
};
