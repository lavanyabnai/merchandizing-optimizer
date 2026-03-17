import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.co2facilities[":id"]["$delete"]>;

export const useDeleteCo2facilitie = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.co2facilities[":id"]["$delete"]({
        param: { id: id as string },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Co2facilitie deleted");
      queryClient.invalidateQueries({ queryKey: ["co2facilitie", { id }] });
      queryClient.invalidateQueries({ queryKey: ["co2facilities"] });
    },
    onError: () => {
      toast.error("Failed to delete co2facilitie");
    },
  });

  return mutation;
};
