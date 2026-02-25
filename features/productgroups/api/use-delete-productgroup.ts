import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productgroups[":id"]["$delete"]>;

export const useDeleteProductgroup = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.productgroups[":id"]["$delete"]({ 
        param: { id: id || "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Productgroup deleted");
      queryClient.invalidateQueries({ queryKey: ["productgroup", { id }] });
      queryClient.invalidateQueries({ queryKey: ["productgroups"] });
    },
    onError: () => {
      toast.error("Failed to delete productgroup");
    },
  });

  return mutation;
};
