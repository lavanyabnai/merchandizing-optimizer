import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.loadingunloadinggates.$post>;
type RequestType = InferRequestType<typeof client.api.loadingunloadinggates.$post>["json"];

export const useCreateLoadingunloadinggate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log(`loadingunloadinggate Data: ${JSON.stringify(json)}`);
      const response = await client.api.loadingunloadinggates.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Loadingunloadinggate created");
      queryClient.invalidateQueries({ queryKey: ["loadingunloadinggates"] });
    },
    onError: () => {
      toast.error("Failed to create loadingunloadinggate");
    },
  });

  return mutation;
};
