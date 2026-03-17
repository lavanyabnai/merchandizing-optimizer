import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.paths.$post>;
type RequestType = InferRequestType<typeof client.api.paths.$post>["json"];

export const useCreatePath = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`path Data: ${JSON.stringify(json)}`);
      const response = await client.api.paths.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Path created");
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
    onError: () => {
      toast.error("Failed to create path");
    },
  });

  return mutation;
};
