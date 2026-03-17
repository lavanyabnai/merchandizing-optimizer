import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.inventorys[":id"]["$delete"]>;

export const useDeleteInventory = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.inventorys[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Inventory deleted");
      queryClient.invalidateQueries({ queryKey: ["inventory", { id }] });
      queryClient.invalidateQueries({ queryKey: ["inventorys"] });
    },
    onError: () => {
      toast.error("Failed to delete inventory");
    },
  });

  return mutation;
};
