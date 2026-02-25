import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productgroups["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.productgroups["bulk-create"]["$post"]>["json"];

export const useBulkCreateProductgroups = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.productgroups["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Productgroupgroups created");
      queryClient.invalidateQueries({ queryKey: ["productgroupgroups"] });
    },
    onError: () => {
      toast.error("Failed to create productgroupgroups");
    },
  });

  return mutation;
};
