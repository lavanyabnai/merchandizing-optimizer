import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.indicatorconstraints["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.indicatorconstraints["bulk-create"]["$post"]>["json"];

export const useBulkCreateIndicatorconstraints = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create indicatorconstraint`, json);
      const response = await client.api.indicatorconstraints["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("indicatorconstraints created");
      queryClient.invalidateQueries({ queryKey: ["indicatorconstraints"] });
    },
    onError: () => {
      toast.error("Failed to create indicatorconstraints");
    },
  });

  return mutation;
};