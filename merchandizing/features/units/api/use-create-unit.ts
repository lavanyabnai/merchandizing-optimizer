import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.units.$post>;
type RequestType = InferRequestType<typeof client.api.units.$post>["json"];

export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('json', json);
      const response = await client.api.units.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Unit created");
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
    onError: () => {
      toast.error("Failed to create unit");
    },
  });

  return mutation;
};
