import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.locations.$post>;
type RequestType = InferRequestType<typeof client.api.locations.$post>["json"];

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.locations.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Location created");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: () => {
      toast.error("Failed to create location");
    },
  });

  return mutation;
};
