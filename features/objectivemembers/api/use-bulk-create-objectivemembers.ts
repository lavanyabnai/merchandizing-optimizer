import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.objectivemembers["bulk-create"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.objectivemembers["bulk-create"]["$post"]>["json"];

export const useBulkCreateobjectivemembers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('Request Payload:', json);

      const formattedPayload = json.map(obj => ({
        ...obj,
        coefficient: Number(obj.coefficient),
        customConstraintId: Number(obj.customConstraintId),
        addToObjective: Boolean(obj.addToObjective)
      }));

      console.log('Formatted Payload:', formattedPayload);

      const response = await client.api.objectivemembers["bulk-create"]["$post"]({ json: formattedPayload.map(obj => ({
        ...obj,
        coefficient: obj.coefficient.toString(),
      })) });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("objectivemembers created");
      queryClient.invalidateQueries({ queryKey: ["objectivemembers"] });
    },
    onError: () => {
      toast.error("Failed to create objectivemembers");
    },
  });

  return mutation;
};
