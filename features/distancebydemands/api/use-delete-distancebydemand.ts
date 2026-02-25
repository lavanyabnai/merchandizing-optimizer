import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.distancebydemands[":id"]["$delete"]>;

export const useDeleteDistancebydemand = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.distancebydemands[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Distancebydemand deleted");
      queryClient.invalidateQueries({ queryKey: ["distancebydemand", { id }] });
      queryClient.invalidateQueries({ queryKey: ["distancebydemands"] });
    },
    onError: () => {
      toast.error("Failed to delete distancebydemand");
    },
  });

  return mutation;
};
