import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.inventorys.$post>;
type RequestType = InferRequestType<typeof client.api.inventorys.$post>["json"];

export const useCreateInventory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {

      const response = await client.api.inventorys.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Inventory created');
      queryClient.invalidateQueries({ queryKey: ['inventorys'] });
    },
    onError: () => {
      toast.error('Failed to create inventory');
    }
  });

  return mutation;
};
