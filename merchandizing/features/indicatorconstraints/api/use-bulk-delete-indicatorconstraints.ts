import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.indicatorconstraints["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.indicatorconstraints["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteIndicatorconstraints = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.indicatorconstraints["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Indicatorconstraints deleted");
      queryClient.invalidateQueries({ queryKey: ["indicatorconstraints"] });
    },
    onError: () => {
      toast.error("Failed to delete indicatorconstraints");
    },
  });

  return mutation;
};
