import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productstorages["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.productstorages["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteproductstorages = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.productstorages["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("productstorages deleted");
      queryClient.invalidateQueries({ queryKey: ["productstorages"] });
    },
    onError: () => {
      toast.error("Failed to delete productstorages");
    },
  });

  return mutation;
};
