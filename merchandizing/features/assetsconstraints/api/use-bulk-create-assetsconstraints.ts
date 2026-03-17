import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.assetsconstraints["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.assetsconstraints["bulk-create"]["$post"]>["json"];

export const useBulkCreateAssetsconstraints = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create assetsconstraints`, json);
      const response = await client.api.assetsconstraints["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Assetsconstraints created");
      queryClient.invalidateQueries({ queryKey: ["assetsconstraints"] });
    },
    onError: () => {
      toast.error("Failed to create assetsconstraints");
    },
  });

  return mutation;
};
