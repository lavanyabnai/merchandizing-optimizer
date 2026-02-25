import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productflows["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.productflows["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteProductflows = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.productflows["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Productflows deleted");
      queryClient.invalidateQueries({ queryKey: ["productflows"] });
    },
    onError: () => {
      toast.error("Failed to delete productflows");
    },
  });

  return mutation;
};
