import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.salesbatches["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.salesbatches["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteSalesbatches = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.salesbatches["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Salesbatches deleted");
      queryClient.invalidateQueries({ queryKey: ["salesbatches"] });
    },
    onError: () => {
      toast.error("Failed to delete salesbatches");
    },
  });

  return mutation;
};
