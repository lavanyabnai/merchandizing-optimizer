import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreatePeriodgroup } from '@/features/periodgroups/api/use-create-periodgroup';
import { useGetPeriodgroups } from '@/features/periodgroups/api/use-get-periodgroups';
import { PeriodgroupForm } from '@/features/periodgroups/components/periodgroup-form';
import { useNewPeriodsgroup } from '@/features/periodgroups/hooks/use-new-periodgroup';

// Assuming you have a schema for periodsgroup, replace this with the actual schema

const periodsgroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof periodsgroupSchema>;

export const NewPeriodgroupSheet = () => {
  const { isOpen, onClose } = useNewPeriodsgroup();

  const createMutation = useCreatePeriodgroup();

  // Placeholder for usePeriodsgroup hook
  const periodsgroupQuery = useGetPeriodgroups();
  const periodsgroupMutation = { isPending: false }; // Replace with actual mutation
  // const onCreatePeriodsgroup = (name: string) => {
  //   // Implement periodsgroup creation logic
  // };

  const isPending = createMutation.isPending || periodsgroupMutation.isPending;
  const isLoading = periodsgroupQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Periodsgroup</SheetTitle>
          <SheetDescription>Add a new periodsgroup</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <PeriodgroupForm
            onSubmit={onSubmit}
            disabled={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
