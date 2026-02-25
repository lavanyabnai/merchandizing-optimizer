import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.cashaccounts[":id"]["$delete"]>;

export const useDeleteCashaccount = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      
      const response = await client.api.cashaccounts[":id"]["$delete"]({ 
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Cashaccount deleted");
      queryClient.invalidateQueries({ queryKey: ["cashaccount", { id }] });
      queryClient.invalidateQueries({ queryKey: ["cashaccounts"] });
    },
    onError: () => {
      toast.error("Failed to delete cashaccount");
    },
  });

  return mutation;
};
