import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.vehicleTypes.$post>;
type RequestType = InferRequestType<typeof client.api.vehicleTypes.$post>["json"];

export const useCreateVehicleType = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('json', json);
      const response = await client.api.vehicleTypes.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Vehicle type created");
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });
    },
    onError: () => {
      toast.error("Failed to create vehicle type");
    },
  });

  return mutation;
};
