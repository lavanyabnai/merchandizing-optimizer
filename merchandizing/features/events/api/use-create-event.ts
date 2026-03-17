import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.events.$post>;
type RequestType = InferRequestType<typeof client.api.events.$post>["json"];

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`event Data: ${JSON.stringify(json)}`);
      const response = await client.api.events.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Event created");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => {
      toast.error("Failed to create event");
    },
  });

  return mutation;
};
