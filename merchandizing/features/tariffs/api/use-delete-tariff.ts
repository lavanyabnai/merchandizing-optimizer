import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.tariffs[":id"]["$delete"]>;

export const useDeleteTariff = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.tariffs[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Tariff deleted");
      queryClient.invalidateQueries({ queryKey: ["tariff", { id }] });
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
    onError: () => {
      toast.error("Failed to delete tariff");
    },
  });

  return mutation;
};
