import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.unitconversions["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.unitconversions["bulk-create"]["$post"]>["json"];

export const useBulkCreateUnitconversions = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create unitconversions`, json);
      const response = await client.api.unitconversions["bulk-create"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Unitconversions created");
      queryClient.invalidateQueries({ queryKey: ["unitconversions"] });
    },
    onError: () => {
      toast.error("Failed to create unitconversions");
    },
  });

  return mutation;
};
