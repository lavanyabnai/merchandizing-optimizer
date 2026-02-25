import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.paymentterms[":id"]["$delete"]>;

export const useDeletePaymentterm = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api.paymentterms[":id"]["$delete"]({ 
        param: { id: id ?? "" },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Paymentterm deleted");
      queryClient.invalidateQueries({ queryKey: ["paymentterm", { id }] });
      queryClient.invalidateQueries({ queryKey: ["paymentterms"] });
    },
    onError: () => {
      toast.error("Failed to delete paymentterm");
    },
  });

  return mutation;
};
