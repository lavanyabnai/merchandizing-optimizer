import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.facilityexpenses["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.facilityexpenses["bulk-create"]["$post"]>["json"];

export const useBulkCreateFacilityexpenses = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create facilityexpenses`, json);
      const response = await client.api.facilityexpenses["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Facilityexpenses created");
      queryClient.invalidateQueries({ queryKey: ["facilityexpenses"] });
    },
    onError: () => {
      toast.error("Failed to create facilityexpenses");
    },
  });

  return mutation;
};
