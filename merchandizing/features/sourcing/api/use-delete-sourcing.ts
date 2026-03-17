import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.sourcing[":id"]["$delete"]>;

export const useDeleteSourcing = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.sourcing[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Sourcing deleted");
      queryClient.invalidateQueries({ queryKey: ["sourcing", { id }] });
      queryClient.invalidateQueries({ queryKey: ["sourcings"] });
    },
    onError: () => {
      toast.error("Failed to delete sourcing");
    },
  });

  return mutation;
};
