import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.facilities[":id"]["$delete"]>;

export const useDeleteFacility = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.facilities[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Facility deleted");
      queryClient.invalidateQueries({ queryKey: ["facility", { id }] });
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
    onError: () => {
      toast.error("Failed to delete facility");
    },
  });

  return mutation;
};
