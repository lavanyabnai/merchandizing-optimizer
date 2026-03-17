import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.periods["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.periods["bulk-delete"]["$post"]>["json"];

export const useBulkDeletePeriods = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.periods["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Periods deleted");
      queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
    onError: () => {
      toast.error("Failed to delete periods");
    },
  });

  return mutation;
};
