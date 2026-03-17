import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.vehicleTypes[":id"]["$delete"]>;

export const useDeletevehicleType = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.vehicleTypes[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("vehicleType deleted");
      queryClient.invalidateQueries({ queryKey: ["vehicleType", { id }] });
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });
    },
    onError: () => {
      toast.error("Failed to delete vehicleType");
    },
  });

  return mutation;
};
