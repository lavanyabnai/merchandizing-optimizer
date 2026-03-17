import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.customconstraints["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.customconstraints["bulk-delete"]["$post"]>["json"];

export const useBulkDeletecustomconstraints = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.customconstraints["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("customconstraints deleted");
      queryClient.invalidateQueries({ queryKey: ["customconstraints"] });
    },
    onError: () => {
      toast.error("Failed to delete customconstraints");
    },
  });

  return mutation;
};
