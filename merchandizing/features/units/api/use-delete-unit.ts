import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.units[":id"]["$delete"]>;

export const useDeleteUnit = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.units[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Unit deleted");
      queryClient.invalidateQueries({ queryKey: ["unit", { id }] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
    onError: () => {
      toast.error("Failed to delete unit");
    },
  });

  return mutation;
};
