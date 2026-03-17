import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.co2processing["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.co2processing["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteCo2processings = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.co2processing["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Co2processings deleted");
      queryClient.invalidateQueries({ queryKey: ["co2processings"] });
    },
    onError: () => {
      toast.error("Failed to delete co2processings");
    },
  });

  return mutation;
};
