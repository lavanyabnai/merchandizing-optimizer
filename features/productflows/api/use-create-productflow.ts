import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productflows.$post>;
type RequestType = InferRequestType<typeof client.api.productflows.$post>["json"];

export const useCreateProductflow = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`productflow Data: ${JSON.stringify(json)}`);
      const response = await client.api.productflows.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Productflow created");
      queryClient.invalidateQueries({ queryKey: ["productflows"] });
    },
    onError: () => {
      toast.error("Failed to create productflow");
    },
  });

  return mutation;
};
