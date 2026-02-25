import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.unitconversions.$post>;
type RequestType = InferRequestType<typeof client.api.unitconversions.$post>["json"];

export const useCreateUnitconversion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.unitconversions.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Unitconversion created");
      queryClient.invalidateQueries({ queryKey: ["unitconversions"] });
    },
    onError: () => {
      toast.error("Failed to create Unitconversion");
    },
  });

  return mutation;
};
