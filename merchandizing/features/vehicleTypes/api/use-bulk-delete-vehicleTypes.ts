import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.vehicleTypes["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.vehicleTypes["bulk-delete"]["$post"]>["json"];

export const useBulkDeletevehicleTypes = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.vehicleTypes["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("vehicleTypes deleted");
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });
    },
    onError: () => {
      toast.error("Failed to delete vehicleTypes");
    },
  });

  return mutation;
};
