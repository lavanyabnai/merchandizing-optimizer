import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkCreateAssortmentHierarchy = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    unknown
  >({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-hierarchy/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to create hierarchy");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Hierarchy imported successfully");
      queryClient.invalidateQueries({ queryKey: ["assortment-db-hierarchy"] });
    },
    onError: () => {
      toast.error("Failed to import hierarchy");
    },
  });

  return mutation;
};
