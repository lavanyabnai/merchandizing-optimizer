import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.periods["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.periods["bulk-create"]["$post"]>["json"];

export const useBulkCreatePeriods = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.periods["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Periods created");
      queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
    onError: () => {
      toast.error("Failed to create periods");
    },
  });

  return mutation;
};
