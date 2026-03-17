import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.vehicleselections["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.vehicleselections["bulk-create"]["$post"]>["json"];

export const useBulkCreateVehicleselections = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create vehicleselections`, json);
      const response = await client.api.vehicleselections["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Vehicleselections created");
      queryClient.invalidateQueries({ queryKey: ["vehicleselections"] });
    },
    onError: () => {
      toast.error("Failed to create vehicleselections");
    },
  });

  return mutation;
};
