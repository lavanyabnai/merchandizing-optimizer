import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.customconstraints[":id"]["$delete"]>;

export const useDeletecustomconstraint = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.customconstraints[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("customconstraint deleted");
      queryClient.invalidateQueries({ queryKey: ["customconstraint", { id }] });
      queryClient.invalidateQueries({ queryKey: ["customconstraints"] });
    },
    onError: () => {
      toast.error("Failed to delete customconstraint");
    },
  });

  return mutation;
};
