import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.facilityexpenses[":id"]["$delete"]>;

export const useDeleteFacilityexpense = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.facilityexpenses[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Facilityexpense deleted");
      queryClient.invalidateQueries({ queryKey: ["facilityexpense", { id }] });
      queryClient.invalidateQueries({ queryKey: ["facilityexpenses"] });
    },
    onError: () => {
      toast.error("Failed to delete facilityexpense");
    },
  });

  return mutation;
};
