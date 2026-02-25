import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.factories.$post>;
type RequestType = InferRequestType<typeof client.api.factories.$post>["json"];

export const useCreateFactory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('json', json);
      const response = await client.api.factories.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Factory created");
      queryClient.invalidateQueries({ queryKey: ["factories"] });
    },
    onError: () => {
      toast.error("Failed to create factory");
    },
  });

  return mutation;
};
