import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.locationgroups[":id"]["$delete"]>;

export const useDeleteLocationgroup = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.locationgroups[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Locationgroup deleted");
      queryClient.invalidateQueries({ queryKey: ["locationgroup", { id }] });
      queryClient.invalidateQueries({ queryKey: ["locationgroups"] });
    },
    onError: () => {
      toast.error("Failed to delete locationgroup");
    },
  });

  return mutation;
};
