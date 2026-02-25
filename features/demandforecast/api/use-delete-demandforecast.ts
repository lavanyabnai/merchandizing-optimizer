import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.demandforecasts[":id"]["$delete"]>;

export const useDeleteDemandforecast = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (id === undefined) {
        throw new Error("Demandforecast ID is required for deletion.");
      }
      const response = await client.api.demandforecasts[":id"]["$delete"]({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Demandforecast deleted");
      queryClient.invalidateQueries({ queryKey: ["demandforecast", { id }] });
      queryClient.invalidateQueries({ queryKey: ["demandforecasts"] });
    },
    onError: () => {
      toast.error("Failed to delete demandforecast");
    },
  });

  return mutation;
};
