import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.orderingrules["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.orderingrules["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteorderingrules = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.orderingrules["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("orderingrules deleted");
      queryClient.invalidateQueries({ queryKey: ["orderingrules"] });
    },
    onError: () => {
      toast.error("Failed to delete orderingrules");
    },
  });

  return mutation;
};
