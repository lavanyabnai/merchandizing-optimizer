import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkCreateAssortmentSpace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    unknown,
    Error,
    unknown
  >({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-space/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to create space data");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Space data imported successfully");
      queryClient.invalidateQueries({ queryKey: ["assortment-db-space"] });
    },
    onError: () => {
      toast.error("Failed to import space data");
    },
  });

  return mutation;
};
