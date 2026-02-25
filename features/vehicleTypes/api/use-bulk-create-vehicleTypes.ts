import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.vehicleTypes["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.vehicleTypes["bulk-create"]["$post"]>["json"];

export const useBulkCreatevehicleTypes = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create vehicleTypes`, json);
      const response = await client.api.vehicleTypes["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("vehicleTypes created");
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });
    },
    onError: () => {
      toast.error("Failed to create vehicleTypes");
    },
  });

  return mutation;
};
