import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.locations["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.locations["bulk-create"]["$post"]>["json"];

export const useBulkCreateLocations = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      // Ensure latitude and longitude are numbers
      const formattedJson = json.map(location => ({
        ...location,
        latitude: location.latitude ? parseFloat(location.latitude as unknown as string) : undefined,
        longitude: location.longitude ? parseFloat(location.longitude as unknown as string) : undefined,
      }));

      const response = await client.api.locations["bulk-create"]["$post"]({ json: formattedJson });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Locations created");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: () => {
      toast.error("Failed to create locations");
    },
  });

  return mutation;
};
