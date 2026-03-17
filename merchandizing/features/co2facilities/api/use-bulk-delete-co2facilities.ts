import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.co2facilities["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.co2facilities["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteCo2facilities = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.co2facilities["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Co2facilities deleted");
      queryClient.invalidateQueries({ queryKey: ["co2facilities"] });
    },
    onError: () => {
      toast.error("Failed to delete co2facilities");
    },
  });

  return mutation;
};
