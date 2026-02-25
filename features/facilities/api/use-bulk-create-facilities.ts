import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.facilities["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.facilities["bulk-create"]["$post"]>["json"];

export const useBulkCreateFacilities = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`bulk create facilities`, json);
      const formattedJson = json.map((facility) => ({
        ...facility,
        capacity: facility.capacity
          ? parseInt(facility.capacity as unknown as string)
          : undefined
      }));
      console.log(`formattedJson`, formattedJson);
      const response = await client.api.facilities["bulk-create"]["$post"]({ json: formattedJson });
  
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Facilities created");
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
    onError: () => {
      toast.error("Failed to create facilities");
    },
  });

  return mutation;
};
