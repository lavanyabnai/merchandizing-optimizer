import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productstorages[":id"]["$delete"]>;

export const useDeleteProductstorage = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.productstorages[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Productstorage deleted");
      queryClient.invalidateQueries({ queryKey: ["productstorage", { id }] });
      queryClient.invalidateQueries({ queryKey: ["productstorages"] });
    },
    onError: () => {
      toast.error("Failed to delete productstorage");
    },
  });

  return mutation;
};
