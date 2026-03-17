import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.suppliers[":id"]["$delete"]>;

export const useDeleteSupplier = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.suppliers[":id"]["$delete"]({ 
        param: { id: id ?? '' },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Supplier deleted");
      queryClient.invalidateQueries({ queryKey: ["supplier", { id }] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => {
      toast.error("Failed to delete supplier");
    },
  });

  return mutation;
};
