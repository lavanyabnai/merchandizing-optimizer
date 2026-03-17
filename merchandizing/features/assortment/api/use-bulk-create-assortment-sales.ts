import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkCreateAssortmentSales = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    unknown
  >({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-sales/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to create sales");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Sales imported successfully");
      queryClient.invalidateQueries({ queryKey: ["assortment-db-sales"] });
    },
    onError: () => {
      toast.error("Failed to import sales");
    },
  });

  return mutation;
};
