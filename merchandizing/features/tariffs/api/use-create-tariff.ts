import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.tariffs.$post>;
type RequestType = InferRequestType<typeof client.api.tariffs.$post>["json"];

export const useCreateTariff = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`tariff Data: ${JSON.stringify(json)}`);
      const response = await client.api.tariffs.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Tariff created");
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
    onError: () => {
      toast.error("Failed to create tariff");
    },
  });

  return mutation;
};
