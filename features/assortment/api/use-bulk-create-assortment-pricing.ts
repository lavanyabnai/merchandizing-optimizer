import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkCreateAssortmentPricing = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    unknown
  >({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-pricing/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to create pricing");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Pricing imported successfully");
      queryClient.invalidateQueries({ queryKey: ["assortment-db-pricing"] });
    },
    onError: () => {
      toast.error("Failed to import pricing");
    },
  });

  return mutation;
};
