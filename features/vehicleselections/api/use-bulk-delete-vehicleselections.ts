import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.vehicleselections["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.vehicleselections["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteVehicleselections = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.vehicleselections["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Vehicleselections deleted");
      queryClient.invalidateQueries({ queryKey: ["vehicleselections"] });
    },
    onError: () => {
      toast.error("Failed to delete vehicleselections");
    },
  });

  return mutation;
};
