import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.assetsconstraints[":id"]["$delete"]>;

export const useDeleteAssetsconstraint = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.assetsconstraints[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Assetsconstraint deleted");
      queryClient.invalidateQueries({ queryKey: ["assetsconstraint", { id }] });
      queryClient.invalidateQueries({ queryKey: ["assetsconstraints"] });
    },
    onError: () => {
      toast.error("Failed to delete assetsconstraint");
    },
  });

  return mutation;
};
