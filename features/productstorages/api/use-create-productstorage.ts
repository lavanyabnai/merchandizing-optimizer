import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productstorages.$post>;
type RequestType = InferRequestType<typeof client.api.productstorages.$post>["json"];

export const useCreateProductstorage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`productstorage Data: ${JSON.stringify(json)}`);
      const response = await client.api.productstorages.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Productstorage created");
      queryClient.invalidateQueries({ queryKey: ["productstorages"] });
    },
    onError: () => {
      toast.error("Failed to create productstorage");
    },
  });

  return mutation;
};
