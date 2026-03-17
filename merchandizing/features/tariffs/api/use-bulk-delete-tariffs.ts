import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.tariffs["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.tariffs["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteTariffs = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.tariffs["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("tariffs deleted");
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
    onError: () => {
      toast.error("Failed to delete tariffs");
    },
  });

  return mutation;
};
