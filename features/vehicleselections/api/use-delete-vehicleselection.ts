import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.vehicleselections[":id"]["$delete"]>;

export const useDeleteVehicleselection = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.vehicleselections[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Vehicleselection deleted");
      queryClient.invalidateQueries({ queryKey: ["vehicleselection", { id }] });
      queryClient.invalidateQueries({ queryKey: ["vehicleselections"] });
    },
    onError: () => {
      toast.error("Failed to delete vehicleselection");
    },
  });

  return mutation;
};
