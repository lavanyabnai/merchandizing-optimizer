import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.suppliers["$post"]>;
type RequestType = InferRequestType<typeof client.api.suppliers["$post"]>["json"];

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.suppliers.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Supplier created");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => {
      toast.error("Failed to create supplier");
    },
  });

  return mutation;
};
