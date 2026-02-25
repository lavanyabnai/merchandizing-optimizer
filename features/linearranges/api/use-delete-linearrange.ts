import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.linearranges[":id"]["$delete"]>;

export const useDeleteLinearrange = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.linearranges[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Linearrange deleted");
      queryClient.invalidateQueries({ queryKey: ["linearrange", { id }] });
      queryClient.invalidateQueries({ queryKey: ["linearranges"] });
    },
    onError: () => {
      toast.error("Failed to delete linearrange");
    },
  });

  return mutation;
};
