import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.vehicleselections.$post>;
type RequestType = InferRequestType<typeof client.api.vehicleselections.$post>["json"];

export const useCreateVehicleselection = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.vehicleselections.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Vehicleselection created");
      queryClient.invalidateQueries({ queryKey: ["vehicleselections"] });
    },
    onError: () => {
      toast.error("Failed to create Vehicleselection");
    },
  });

  return mutation;
};
