import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.locationgroups["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.locationgroups["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteLocationgroups = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.locationgroups["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Locationgroups deleted");
      queryClient.invalidateQueries({ queryKey: ["locationgroups"] });
    },
    onError: () => {
      toast.error("Failed to delete locationgroups");
    },
  });

  return mutation;
};
