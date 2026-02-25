import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.timewindows.$post>;
type RequestType = InferRequestType<typeof client.api.timewindows.$post>["json"];

export const useCreateTimewindow = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`timewindow Data: ${JSON.stringify(json)}`);
      const response = await client.api.timewindows.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Timewindow created");
      queryClient.invalidateQueries({ queryKey: ["timewindows"] });
    },
    onError: () => {
      toast.error("Failed to create timewindow");
    },
  });

  return mutation;
};
