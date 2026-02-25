import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.timewindows[":id"]["$delete"]>;

export const useDeleteTimewindow = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.timewindows[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Timewindow deleted");
      queryClient.invalidateQueries({ queryKey: ["timewindow", { id }] });
      queryClient.invalidateQueries({ queryKey: ["timewindows"] });
    },
    onError: () => {
      toast.error("Failed to delete timewindow");
    },
  });

  return mutation;
};
