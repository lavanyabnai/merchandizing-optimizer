import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.processingtime[":id"]["$delete"]>;

export const useDeleteProcessingtime = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.processingtime[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Processingtime deleted");
      queryClient.invalidateQueries({ queryKey: ["processingtime", { id }] });
      queryClient.invalidateQueries({ queryKey: ["processingtimes"] });
    },
    onError: () => {
      toast.error("Failed to delete processingtime");
    },
  });

  return mutation;
};
