import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.loadingunloadinggates["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.loadingunloadinggates["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteloadingunloadinggates = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.loadingunloadinggates["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("loadingunloadinggates deleted");
      queryClient.invalidateQueries({ queryKey: ["loadingunloadinggates"] });
    },
    onError: () => {
      toast.error("Failed to delete loadingunloadinggates");
    },
  });

  return mutation;
};
