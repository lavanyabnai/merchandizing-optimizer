import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.inventorys["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.inventorys["bulk-create"]["$post"]>["json"];

export const useBulkCreateInventorys = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create inventorys`, json);
      const response = await client.api.inventorys["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Inventorys created");
      queryClient.invalidateQueries({ queryKey: ["inventorys"] });
    },
    onError: () => {
      toast.error("Failed to create inventorys");
    },
  });

  return mutation;
};
