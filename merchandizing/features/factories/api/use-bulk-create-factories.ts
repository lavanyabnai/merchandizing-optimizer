import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.factories["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.factories["bulk-create"]["$post"]>["json"];

export const useBulkCreateFactories = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.factories["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Factories created");
      queryClient.invalidateQueries({ queryKey: ["factories"] });
    },
    onError: () => {
      toast.error("Failed to create factories");
    },
  });

  return mutation;
};
