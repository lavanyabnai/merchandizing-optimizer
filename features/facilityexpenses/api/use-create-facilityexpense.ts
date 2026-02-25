import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.facilityexpenses.$post>;
type RequestType = InferRequestType<typeof client.api.facilityexpenses.$post>["json"];

export const useCreateFacilityexpense = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.facilityexpenses.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Facilityexpense created");
      queryClient.invalidateQueries({ queryKey: ["facilityexpenses"] });
    },
    onError: () => {
      toast.error("Failed to create facilityexpense");
    },
  });

  return mutation;
};
