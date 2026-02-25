import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.sitestatechanges[":id"]["$delete"]>;

export const useDeleteSitestatechange = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.sitestatechanges[":id"]["$delete"]({ 
        param: { id: id || "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Sitestatechange deleted");
      queryClient.invalidateQueries({ queryKey: ["sitestatechange", { id }] });
      queryClient.invalidateQueries({ queryKey: ["sitestatechanges"] });
    },
    onError: () => {
      toast.error("Failed to delete sitestatechange");
    },
  });

  return mutation;
};
