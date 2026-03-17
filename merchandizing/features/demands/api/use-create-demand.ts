import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.demands.$post>;
type RequestType = InferRequestType<typeof client.api.demands.$post>["json"];

export const useCreateDemand = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`demand Data: ${JSON.stringify(json)}`);
      const response = await client.api.demands.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Demand created");
      queryClient.invalidateQueries({ queryKey: ["demands"] });
    },
    onError: () => {
      toast.error("Failed to create demand");
    },
  });

  return mutation;
};
