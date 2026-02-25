import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.demandforecasts["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.demandforecasts["bulk-delete"]["$post"]>["json"];

export const useBulkDeletedemandforecasts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.demandforecasts["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("demandforecasts deleted");
      queryClient.invalidateQueries({ queryKey: ["demandforecasts"] });
    },
    onError: () => {
      toast.error("Failed to delete demandforecasts");
    },
  });

  return mutation;
};
