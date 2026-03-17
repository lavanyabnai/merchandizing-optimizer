import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.milkruns["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.milkruns["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteMilkruns = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.milkruns["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("milkruns deleted");
      queryClient.invalidateQueries({ queryKey: ["milkruns"] });
    },
    onError: () => {
      toast.error("Failed to delete milkruns");
    },
  });

  return mutation;
};
