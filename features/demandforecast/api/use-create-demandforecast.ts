import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.demandforecasts.$post>;
type RequestType = InferRequestType<typeof client.api.demandforecasts.$post>["json"];

export const useCreateDemandforecast = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`demandforecast Data: ${JSON.stringify(json)}`);
      const response = await client.api.demandforecasts.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Demandforecast created");
      queryClient.invalidateQueries({ queryKey: ["demandforecasts"] });
    },
    onError: () => {
      toast.error("Failed to create demandforecast");
    },
  });

  return mutation;
};
