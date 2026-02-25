import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.net_scenarios.$post>;
type RequestType = InferRequestType<typeof client.api.net_scenarios.$post>["json"];

export const useCreateNetScenario = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('json', json);
      const response = await client.api.net_scenarios.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Net scenario created");
      queryClient.invalidateQueries({ queryKey: ["net_scenarios"] });
    },
    onError: () => {
      toast.error("Failed to create net scenario");
    },
  });

  return mutation;
};
