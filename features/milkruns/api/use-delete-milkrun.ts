import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.milkruns[":id"]["$delete"]>;

export const useDeleteMilkrun = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.milkruns[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Milkrun deleted");
      queryClient.invalidateQueries({ queryKey: ["milkrun", { id }] });
      queryClient.invalidateQueries({ queryKey: ["milkruns"] });
    },
    onError: () => {
      toast.error("Failed to delete milkrun");
    },
  });

  return mutation;
};
