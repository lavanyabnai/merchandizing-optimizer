import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.co2processing["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.co2processing["bulk-create"]["$post"]>["json"];

export const useBulkCreateCo2processings = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create co2processings`, json);
      const response = await client.api.co2processing["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Co2processings created");
      queryClient.invalidateQueries({ queryKey: ["co2processings"] });
    },
    onError: () => {
      toast.error("Failed to create co2processings");
    },
  });

  return mutation;
};
