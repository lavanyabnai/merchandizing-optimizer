import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.snops["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.snops["bulk-create"]["$post"]>["json"];

export const useBulkCreateSnops = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create snops`, json);
      const response = await client.api.snops["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Snops created");
      queryClient.invalidateQueries({ queryKey: ["snops"] });
    },
    onError: () => {
      toast.error("Failed to create snops");
    },
  });

  return mutation;
};
