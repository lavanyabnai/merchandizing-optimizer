import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.orderingrules[":id"]["$delete"]>;

export const useDeleteOrderingrule = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.orderingrules[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Orderingrule deleted");
      queryClient.invalidateQueries({ queryKey: ["orderingrule", { id }] });
      queryClient.invalidateQueries({ queryKey: ["orderingrules"] });
    },
    onError: () => {
      toast.error("Failed to delete orderingrule");
    },
  });

  return mutation;
};
