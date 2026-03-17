import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.paths[":id"]["$delete"]>;

export const useDeletePath = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.paths[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Path deleted");
      queryClient.invalidateQueries({ queryKey: ["path", { id }] });
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
    onError: () => {
      toast.error("Failed to delete path");
    },
  });

  return mutation;
};
