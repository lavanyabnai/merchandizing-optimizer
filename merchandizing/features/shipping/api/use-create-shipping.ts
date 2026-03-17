import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.shipping.$post>;
type RequestType = InferRequestType<typeof client.api.shipping.$post>["json"];

export const useCreateShipping = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.shipping.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Shipping created");
      queryClient.invalidateQueries({ queryKey: ["shipping"] });
    },
    onError: () => {
      toast.error("Failed to create shipping");
    },
  });

  return mutation;
};
