import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.paymentterms["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.paymentterms["bulk-delete"]["$post"]>["json"];

export const useBulkDeletePaymentterms = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.paymentterms["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Paymentterms deleted");
      queryClient.invalidateQueries({ queryKey: ["paymentterms"] });
    },
    onError: () => {
      toast.error("Failed to delete paymentterms");
    },
  });

  return mutation;
};
