import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.net_scenarios["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.net_scenarios["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteNetScenarios = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.net_scenarios["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Net scenarios deleted");
      queryClient.invalidateQueries({ queryKey: ["net_scenarios"] });
    },
    onError: () => {
      toast.error("Failed to delete net scenarios");
    },
  });

  return mutation;
};
