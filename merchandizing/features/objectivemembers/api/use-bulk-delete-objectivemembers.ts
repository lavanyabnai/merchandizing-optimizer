import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.objectivemembers["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.objectivemembers["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteobjectivemembers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.objectivemembers["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("objectivemembers deleted");
      queryClient.invalidateQueries({ queryKey: ["objectivemembers"] });
    },
    onError: () => {
      toast.error("Failed to delete objectivemembers");
    },
  });

  return mutation;
};
