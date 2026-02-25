import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.objectivemembers[":id"]["$delete"]>;

export const useDeleteobjectivemember = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.objectivemembers[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("customconstraint deleted");
      queryClient.invalidateQueries({ queryKey: ["objectivemember", { id }] });
      queryClient.invalidateQueries({ queryKey: ["objectivemembers"] });
    },
    onError: () => {
      toast.error("Failed to delete objectivemember");
    },
  });

  return mutation;
};
