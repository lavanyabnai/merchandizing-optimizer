import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.processingcosts[":id"]["$delete"]>;

export const useDeleteProcessingcost = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.processingcosts[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Processingcost deleted");
      queryClient.invalidateQueries({ queryKey: ["processingcost", { id }] });
      queryClient.invalidateQueries({ queryKey: ["processingcosts"] });
    },
    onError: () => {
      toast.error("Failed to delete processingcost");
    },
  });

  return mutation;
};
