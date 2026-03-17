import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkCreateAssortmentCustomers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    unknown
  >({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-customers/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to create customers");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Customers imported successfully");
      queryClient.invalidateQueries({ queryKey: ["assortment-db-customers"] });
    },
    onError: () => {
      toast.error("Failed to import customers");
    },
  });

  return mutation;
};
