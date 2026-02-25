import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.co2processing[":id"]["$delete"]>;

export const useDeleteCo2processing = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.co2processing[":id"]["$delete"]({ 
        param: { id: id as string },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Co2processing deleted");
      queryClient.invalidateQueries({ queryKey: ["co2processing", { id }] });
      queryClient.invalidateQueries({ queryKey: ["co2processings"] });
    },
    onError: () => {
      toast.error("Failed to delete co2processing");
    },
  });

  return mutation;
};
