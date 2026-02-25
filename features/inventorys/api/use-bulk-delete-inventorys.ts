import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.inventorys["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.inventorys["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteInventorys = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.inventorys["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Inventorys deleted");
      queryClient.invalidateQueries({ queryKey: ["inventorys"] });
    },
    onError: () => {
      toast.error("Failed to delete inventorys");
    },
  });

  return mutation;
};
