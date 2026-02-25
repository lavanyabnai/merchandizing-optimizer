import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.fleets.$post>;
type RequestType = InferRequestType<typeof client.api.fleets.$post>["json"];

export const useCreateFleet = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`fleet Data: ${JSON.stringify(json)}`);
      const response = await client.api.fleets.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Fleet created");
      queryClient.invalidateQueries({ queryKey: ["fleets"] });
    },
    onError: () => {
      toast.error("Failed to create fleet");
    },
  });

  return mutation;
};
