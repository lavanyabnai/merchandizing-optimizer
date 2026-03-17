import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productflows[":id"]["$delete"]>;

export const useDeleteProductflow = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.productflows[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Productflow deleted");
      queryClient.invalidateQueries({ queryKey: ["productflow", { id }] });
      queryClient.invalidateQueries({ queryKey: ["productflows"] });
    },
    onError: () => {
      toast.error("Failed to delete productflow");
    },
  });

  return mutation;
};
