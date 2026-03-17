import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.fleets["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.fleets["bulk-create"]["$post"]>["json"];

export const useBulkCreateFleets = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create customers`, json);
      
      const response = await client.api.fleets["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("fleets created");
      queryClient.invalidateQueries({ queryKey: ["fleets"] });
    },
    onError: () => {
      toast.error("Failed to create fleets");
    },
  });

  return mutation;
};