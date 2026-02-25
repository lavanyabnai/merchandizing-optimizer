import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.unitconversions[":id"]["$delete"]>;

export const useDeleteUnitconversion = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.unitconversions[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Unitconversion deleted");
      queryClient.invalidateQueries({ queryKey: ["unitconversion", { id }] });
      queryClient.invalidateQueries({ queryKey: ["unitconversions"] });
    },
    onError: () => {
      toast.error("Failed to delete unitconversion");
    },
  });

  return mutation;
};
