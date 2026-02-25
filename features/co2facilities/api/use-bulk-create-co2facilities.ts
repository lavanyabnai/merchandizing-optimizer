import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.co2facilities["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.co2facilities["bulk-create"]["$post"]>["json"];

export const useBulkCreateCo2facilities = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create co2facilities`, json);
      const response = await client.api.co2facilities["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Co2facilities created");
      queryClient.invalidateQueries({ queryKey: ["co2facilities"] });
    },
    onError: () => {
      toast.error("Failed to create co2facilities");
    },
  });

  return mutation;
};
