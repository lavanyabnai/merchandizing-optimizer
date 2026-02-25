import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.bomcomponents.$post>;
type RequestType = InferRequestType<typeof client.api.bomcomponents.$post>["json"];

export const useCreateBomcomponent = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.bomcomponents.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Bomcomponent created");
      queryClient.invalidateQueries({ queryKey: ["bomcomponents"] });
    },
    onError: () => {
      toast.error("Failed to create bomcomponent");
    },
  });

  return mutation;
};
