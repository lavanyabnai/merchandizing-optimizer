import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.milkruns.$post>;
type RequestType = InferRequestType<typeof client.api.milkruns.$post>["json"];

export const useCreateMilkrun = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`milkrun Data: ${JSON.stringify(json)}`);
      const response = await client.api.milkruns.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Milkrun created");
      queryClient.invalidateQueries({ queryKey: ["milkruns"] });
    },
    onError: () => {
      toast.error("Failed to create milkrun");
    },
  });

  return mutation;
};
