import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.locationgroups.$post>;
type RequestType = InferRequestType<typeof client.api.locationgroups.$post>["json"];

export const useCreateLocationgroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('json', json);
      const response = await client.api.locationgroups.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Locationgroup created");
      queryClient.invalidateQueries({ queryKey: ["locationgroups"] });
    },
    onError: () => {
      toast.error("Failed to create locationgroup");
    },
  });

  return mutation;
};
