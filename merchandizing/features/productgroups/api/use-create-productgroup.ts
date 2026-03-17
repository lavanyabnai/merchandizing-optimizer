import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.productgroups.$post>;
type RequestType = InferRequestType<typeof client.api.productgroups.$post>["json"];

export const useCreateProductgroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('json', json);
      const response = await client.api.productgroups.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Productgroup created");
      queryClient.invalidateQueries({ queryKey: ["productgroups"] });
    },
    onError: () => {
      toast.error("Failed to create productgroup");
    },
  });

  return mutation;
};
