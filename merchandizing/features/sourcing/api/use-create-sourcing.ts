import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.sourcing.$post>;
type RequestType = InferRequestType<typeof client.api.sourcing.$post>["json"];

export const useCreateSourcing = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`sourcing Data: ${JSON.stringify(json)}`);
      const response = await client.api.sourcing.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Sourcing created");
      queryClient.invalidateQueries({ queryKey: ["sourcings"] });
    },
    onError: () => {
      toast.error("Failed to create sourcing");
    },
  });

  return mutation;
};
