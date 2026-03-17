import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.indicatorconstraints[":id"]["$delete"]>;

export const useDeleteIndicatorconstraint = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.indicatorconstraints[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Indicatorconstraint deleted");
      queryClient.invalidateQueries({ queryKey: ["indicatorconstraint", { id }] });
      queryClient.invalidateQueries({ queryKey: ["indicatorconstraints"] });
    },
    onError: () => {
      toast.error("Failed to delete indicatorconstraint");
    },
  });

  return mutation;
};
