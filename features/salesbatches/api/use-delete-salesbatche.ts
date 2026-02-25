import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.salesbatches[":id"]["$delete"]>;

export const useDeleteSalesbatche = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.salesbatches[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Salesbatche deleted");
      queryClient.invalidateQueries({ queryKey: ["salesbatche", { id }] });
      queryClient.invalidateQueries({ queryKey: ["salesbatches"] });
    },
    onError: () => {
      toast.error("Failed to delete salesbatche");
    },
  });

  return mutation;
};
