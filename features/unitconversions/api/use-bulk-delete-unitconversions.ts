import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.unitconversions["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.unitconversions["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteUnitconversions = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.unitconversions["bulk-delete"]["$post"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Unitconversions deleted");
      queryClient.invalidateQueries({ queryKey: ["unitconversions"] });
    },
    onError: () => {
      toast.error("Failed to delete unitconversions");
    },
  });

  return mutation;
};
