import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.periodgroups["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.periodgroups["bulk-create"]["$post"]>["json"];

export const useBulkCreatePeriodgroups = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.periodgroups["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Periodgroups created");
      queryClient.invalidateQueries({ queryKey: ["periodgroups"] });
    },
    onError: () => {
      toast.error("Failed to create periodgroups");
    },
  });

  return mutation;
};
