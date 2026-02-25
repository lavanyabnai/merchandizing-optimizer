import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.bomcomponents["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.bomcomponents["bulk-create"]["$post"]>["json"];

export const useBulkCreateBomcomponents = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log(`bulk create bomcomponents`, json);
      const response = await client.api.bomcomponents['bulk-create']['$post']({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Bomcomponents created');
      queryClient.invalidateQueries({ queryKey: ['bomcomponents'] });
    },
    onError: () => {
      toast.error('Failed to create bomcomponents');
    }
  });

  return mutation;
};
