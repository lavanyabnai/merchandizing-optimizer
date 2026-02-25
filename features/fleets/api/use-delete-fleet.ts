import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.fleets[":id"]["$delete"]>;

export const useDeleteFleet = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.fleets[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Fleet deleted");
      queryClient.invalidateQueries({ queryKey: ["fleet", { id }] });
      queryClient.invalidateQueries({ queryKey: ["fleets"] });
    },
    onError: () => {
      toast.error("Failed to delete fleet");
    },
  });

  return mutation;
};
