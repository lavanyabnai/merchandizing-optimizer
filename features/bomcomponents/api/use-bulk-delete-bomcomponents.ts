import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.bomcomponents["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.bomcomponents["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteBomcomponents = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.bomcomponents["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Bomcomponents deleted");
      queryClient.invalidateQueries({ queryKey: ["bomcomponents"] });
    },
    onError: () => {
      toast.error("Failed to delete bomcomponents");
    },
  });

  return mutation;
};
