import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.assetsconstraints.$post>;
type RequestType = InferRequestType<typeof client.api.assetsconstraints.$post>["json"];

export const useCreateAssetsconstraint = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      // Convert string fields to numbers if necessary
      const formattedJson = {
        ...json,
        minDcs: typeof json.minDcs === 'string' ? parseInt(json.minDcs, 10) : json.minDcs,
        maxDcs: typeof json.maxDcs === 'string' ? parseInt(json.maxDcs, 10) : json.maxDcs,
      };

      const response = await client.api.assetsconstraints.$post({ json: formattedJson });
      return await response.json();
    },

    // mutationFn: async (json) => {
    //   console.log(`bulk create facilities`, json);
    //   const formattedJson = json.map((facility) => ({
    //     ...facility,
    //     capacity: facility.capacity
    //       ? parseInt(facility.capacity as unknown as string)
    //       : undefined
    //   }));
    //   console.log(`formattedJson`, formattedJson);
    //   const response = await client.api.facilities['bulk-create']['$post']({
    //     json: formattedJson
    //   });

    //   return await response.json();
    // },
    onSuccess: () => {
      toast.success('Assetsconstraint created');
      queryClient.invalidateQueries({ queryKey: ['assetsconstraints'] });
    },
    onError: () => {
      toast.error('Failed to create assetsconstraint');
    }
  });

  return mutation;
};
