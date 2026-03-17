import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.cashaccounts["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.cashaccounts["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteCashaccounts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.cashaccounts["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Cashaccounts deleted");
      queryClient.invalidateQueries({ queryKey: ["cashaccounts"] });
    },
    onError: () => {
      toast.error("Failed to delete cashaccounts");
    },
  });

  return mutation;
};
