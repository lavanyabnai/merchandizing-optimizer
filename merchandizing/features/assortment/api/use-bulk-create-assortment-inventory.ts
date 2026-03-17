import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkCreateAssortmentInventory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    unknown
  >({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-inventory/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to create inventory");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Inventory imported successfully");
      queryClient.invalidateQueries({ queryKey: ["assortment-db-inventory"] });
    },
    onError: () => {
      toast.error("Failed to import inventory");
    },
  });

  return mutation;
};
