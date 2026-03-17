import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.bomcomponents[":id"]["$delete"]>;

export const useDeleteBomcomponent = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.bomcomponents[":id"]["$delete"]({ 
        param: { id: id as string },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Bomcomponent deleted");
      queryClient.invalidateQueries({ queryKey: ["bomcomponent", { id }] });
      queryClient.invalidateQueries({ queryKey: ["bomcomponents"] });
    },
    onError: () => {
      toast.error("Failed to delete bomcomponent");
    },
  });

  return mutation;
};
