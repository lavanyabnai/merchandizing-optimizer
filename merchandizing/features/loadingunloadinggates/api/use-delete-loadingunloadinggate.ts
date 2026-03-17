import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.loadingunloadinggates[":id"]["$delete"]>;

export const useDeleteLoadingunloadinggate = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.loadingunloadinggates[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Loadingunloadinggate deleted");
      queryClient.invalidateQueries({ queryKey: ["loadingunloadinggate", { id }] });
      queryClient.invalidateQueries({ queryKey: ["loadingunloadinggates"] });
    },
    onError: () => {
      toast.error("Failed to delete loadingunloadinggate");
    },
  });

  return mutation;
};
