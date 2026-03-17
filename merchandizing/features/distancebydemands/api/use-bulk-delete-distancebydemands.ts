import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.distancebydemands["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.distancebydemands["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteDistancebydemands = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.distancebydemands["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Distancebydemands deleted");
      queryClient.invalidateQueries({ queryKey: ["distancebydemands"] });
    },
    onError: () => {
      toast.error("Failed to delete distancebydemands");
    },
  });

  return mutation;
};
