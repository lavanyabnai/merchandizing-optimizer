import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.periodgroups[":id"]["$delete"]>;

export const useDeletePeriodgroup = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.periodgroups[":id"]["$delete"]({ 
        param: { id: id || "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Periodgroup deleted");
      queryClient.invalidateQueries({ queryKey: ["periodgroup", { id }] });
      queryClient.invalidateQueries({ queryKey: ["periodgroups"] });
    },
    onError: () => {
      toast.error("Failed to delete periodgroup");
    },
  });

  return mutation;
};
