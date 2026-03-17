import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.factories[":id"]["$delete"]>;

export const useDeleteFactory = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.factories[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Factory deleted");
      queryClient.invalidateQueries({ queryKey: ["factory", { id }] });
      queryClient.invalidateQueries({ queryKey: ["factories"] });
    },
    onError: () => {
      toast.error("Failed to delete factory");
    },
  });

  return mutation;
};
