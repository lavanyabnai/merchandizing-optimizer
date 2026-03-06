import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteAssortmentScenario = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error
  >({
    mutationFn: async () => {
      const response = await fetch(`/api/assortment-scenarios/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete scenario");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Scenario deleted");
      queryClient.invalidateQueries({ queryKey: ["assortment-scenario", { id }] });
      queryClient.invalidateQueries({ queryKey: ["assortment-scenarios"] });
    },
    onError: () => {
      toast.error("Failed to delete scenario");
    },
  });

  return mutation;
};
