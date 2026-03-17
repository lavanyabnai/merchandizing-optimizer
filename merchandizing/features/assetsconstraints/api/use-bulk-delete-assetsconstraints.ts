import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.assetsconstraints["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.assetsconstraints["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteAssetsconstraints = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.assetsconstraints["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Assetsconstraints deleted");
      queryClient.invalidateQueries({ queryKey: ["assetsconstraints"] });
    },
    onError: () => {
      toast.error("Failed to delete assetsconstraints");
    },
  });

  return mutation;
};
