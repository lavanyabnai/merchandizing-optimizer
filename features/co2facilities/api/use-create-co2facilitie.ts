import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.co2facilities.$post>;
type RequestType = InferRequestType<typeof client.api.co2facilities.$post>["json"];

export const useCreateCo2facilitie = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.co2facilities.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Co2facilitie created");
      queryClient.invalidateQueries({ queryKey: ["co2facilities"] });
    },
    onError: () => {
      toast.error("Failed to create co2facilitie");
    },
  });

  return mutation;
};
