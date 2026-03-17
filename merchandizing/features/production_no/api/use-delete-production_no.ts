import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.production_no[":id"]["$delete"]>;

export const useDeleteProduction_no = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.production_no[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Production_no deleted");
      queryClient.invalidateQueries({ queryKey: ["production_no", { id }] });
      queryClient.invalidateQueries({ queryKey: ["production_nos"] });
    },
    onError: () => {
      toast.error("Failed to delete production_no");
    },
  });

  return mutation;
};
