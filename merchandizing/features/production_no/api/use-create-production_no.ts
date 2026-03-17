import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.production_no.$post>;
type RequestType = InferRequestType<typeof client.api.production_no.$post>["json"];

export const useCreateProduction_no = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`production_no Data: ${JSON.stringify(json)}`);
      const response = await client.api.production_no.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Production_no created");
      queryClient.invalidateQueries({ queryKey: ["production_nos"] });
    },
    onError: () => {
      toast.error("Failed to create production_no");
    },
  });

  return mutation;
};
