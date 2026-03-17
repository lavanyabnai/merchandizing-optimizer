import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.suppliers["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.suppliers["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteSuppliers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.suppliers["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Suppliers deleted");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => {
      toast.error("Failed to delete suppliers");
    },
  });

  return mutation;
};
