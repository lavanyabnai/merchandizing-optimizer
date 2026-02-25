import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useNewNetScenario } from '@/features/net_scenario/hooks/use-new-net_scenario';
import { useCreateNetScenario } from '@/features/net_scenario/api/use-create-net_scenario';
import { useGetGroups } from '@/features/groups/api/use-get-groups';
import { NetScenarioForm } from './net_scenario-form';

// Assuming you have a schema for group, replace this with the actual schema

const netScenarioSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional()
});

type FormValues = z.infer<typeof netScenarioSchema>;

export const NewNetScenarioSheet = () => {
  const { isOpen, onClose } = useNewNetScenario();

  const createMutation = useCreateNetScenario();

  // Placeholder for useGroup hook
  const groupQuery = useGetGroups();
  const groupMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateGroup = (name: string) => {
  //   // Implement group creation logic
  // };

  const isPending = createMutation.isPending || groupMutation.isPending;
  const isLoading = groupQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const mutationPayload = {
      ...values,
      // Provide required fields with placeholder or default values
      netId: '', // TODO: Replace with actual netId
      scenarioType: '', // TODO: Replace with actual scenarioType
    };
    createMutation.mutate(mutationPayload, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Net Scenario</SheetTitle>
          <SheetDescription>Add a new net scenario</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <NetScenarioForm
            onSubmit={onSubmit}
            disabled={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

