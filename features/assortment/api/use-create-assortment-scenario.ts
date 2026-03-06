import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateScenarioInput {
  userId: string;
  name?: string;
  type: string;
  status: string;
  storeId?: number;
  inputs: unknown;
  results?: unknown;
  summary?: unknown;
  executionTimeMs?: number;
  errorMessage?: string;
}

export const useCreateAssortmentScenario = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, CreateScenarioInput>({
    mutationFn: async (json) => {
      const response = await fetch("/api/assortment-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!response.ok) throw new Error("Failed to create scenario");
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Scenario saved");
      queryClient.invalidateQueries({ queryKey: ["assortment-scenarios"] });
    },
    onError: () => {
      toast.error("Failed to save scenario");
    },
  });

  return mutation;
};
