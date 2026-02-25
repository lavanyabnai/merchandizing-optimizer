import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.net_scenarios[":id"]["$delete"]>;

export const useDeleteNetScenario = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.net_scenarios[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Net scenario deleted");
      queryClient.invalidateQueries({ queryKey: ["net_scenario", { id }] });
      queryClient.invalidateQueries({ queryKey: ["net_scenarios"] });
    },
    onError: () => {
      toast.error("Failed to delete net scenario");
    },
  });

  return mutation;
};
