import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.facilities.$post>;
type RequestType = InferRequestType<typeof client.api.facilities.$post>["json"];

export const useCreateFacility = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.facilities.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Facility created");
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
    onError: () => {
      toast.error("Failed to create facility");
    },
  });

  return mutation;
};
