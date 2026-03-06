import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkDeleteAssortmentProducts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    unknown
  >({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to delete products");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Products deleted");
      queryClient.invalidateQueries({ queryKey: ["assortment-db-products"] });
    },
    onError: () => {
      toast.error("Failed to delete products");
    },
  });

  return mutation;
};
