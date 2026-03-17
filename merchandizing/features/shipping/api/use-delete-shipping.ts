import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.shipping[":id"]["$delete"]>;

export const useDeleteShipping = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.shipping[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Shipping deleted");
      queryClient.invalidateQueries({ queryKey: ["shipping", { id }] });
      queryClient.invalidateQueries({ queryKey: ["shipping"] });
    },
    onError: () => {
      toast.error("Failed to delete shipping");
    },
  });

  return mutation;
};
