import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkCreateAssortmentStores = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    unknown
  >({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-stores/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to create stores");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Stores imported successfully");
      queryClient.invalidateQueries({ queryKey: ["assortment-db-stores"] });
    },
    onError: () => {
      toast.error("Failed to import stores");
    },
  });

  return mutation;
};
