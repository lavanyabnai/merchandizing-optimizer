import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.factories["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.factories["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteFactories = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.factories["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Factories deleted");
      queryClient.invalidateQueries({ queryKey: ["factories"] });
    },
    onError: () => {
      toast.error("Failed to delete factories");
    },
  });

  return mutation;
};
