import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.demands[":id"]["$delete"]>;

export const useDeleteDemand = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.demands[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Demand deleted");
      queryClient.invalidateQueries({ queryKey: ["demand", { id }] });
      queryClient.invalidateQueries({ queryKey: ["demands"] });
    },
    onError: () => {
      toast.error("Failed to delete demand");
    },
  });

  return mutation;
};
