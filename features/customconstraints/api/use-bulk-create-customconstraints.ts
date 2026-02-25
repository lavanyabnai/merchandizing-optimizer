import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.customconstraints["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.customconstraints["bulk-create"]["$post"]>["json"];

export const useBulkCreatecustomconstraints = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customconstraints`, json);
      const response = await client.api.customconstraints["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("customconstraints created");
      queryClient.invalidateQueries({ queryKey: ["customconstraints"] });
    },
    onError: () => {
      toast.error("Failed to create customconstraints");
    },
  });

  return mutation;
};
