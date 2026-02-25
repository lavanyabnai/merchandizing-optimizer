import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.periods.$post>;
type RequestType = InferRequestType<typeof client.api.periods.$post>["json"];

export const useCreatePeriod = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('json', json);
      const response = await client.api.periods.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Period created");
      queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
    onError: () => {
      toast.error("Failed to create period");
    },
  });

  return mutation;
};
