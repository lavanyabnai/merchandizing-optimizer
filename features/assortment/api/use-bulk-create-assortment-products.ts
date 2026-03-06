import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkCreateAssortmentProducts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    unknown
  >({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-products/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to create products");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Products imported successfully");
      queryClient.invalidateQueries({ queryKey: ["assortment-db-products"] });
    },
    onError: () => {
      toast.error("Failed to import products");
    },
  });

  return mutation;
};
