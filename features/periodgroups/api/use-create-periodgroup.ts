import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.periodgroups.$post>;
type RequestType = InferRequestType<typeof client.api.periodgroups.$post>["json"];

export const useCreatePeriodgroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('json', json);
      const response = await client.api.periodgroups.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Periodgroup created");
      queryClient.invalidateQueries({ queryKey: ["periodgroups"] });
    },
    onError: () => {
      toast.error("Failed to create periodgroup");
    },
  });

  return mutation;
};
