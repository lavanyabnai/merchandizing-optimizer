import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.sitestatechanges.$post>;
type RequestType = InferRequestType<typeof client.api.sitestatechanges.$post>["json"];

export const useCreateSitestatechange = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`sitestatechange Data: ${JSON.stringify(json)}`);
      const response = await client.api.sitestatechanges.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Sitestatechange created");
      queryClient.invalidateQueries({ queryKey: ["sitestatechanges"] });
    },
    onError: () => {
      toast.error("Failed to create sitestatechange");
    },
  });

  return mutation;
};
