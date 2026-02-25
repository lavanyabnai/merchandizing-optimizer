import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreatePeriod } from '@/features/periods/api/use-create-period';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { PeriodForm } from '@/features/periods/components/period-form';
import { useNewPeriod } from '@/features/periods/hooks/use-new-period';

// Assuming you have a schema for period, replace this with the actual schema
const periodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  start: z.string().min(1, 'Start is required'),
  end: z.string().min(1, 'End is required'),
  demandCoefficient: z.number().min(1, 'Demand Coefficient is required')
});

type FormValues = z.infer<typeof periodSchema>;



export const NewPeriodSheet = () => {
  const { isOpen, onClose } = useNewPeriod();

  const createMutation = useCreatePeriod();

  // Placeholder for usePeriod hook
  const periodQuery = useGetPeriods();
  const periodMutation = { isPending: false }; // Replace with actual mutation
  // const onCreatePeriod = (name: string) => {
  //   // Implement period creation logic
  // };

  const isPending = createMutation.isPending || periodMutation.isPending;
  const isLoading = periodQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      ...values,
      startDate: new Date(values.start),
      endDate: new Date(values.end)
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Period</SheetTitle>
          <SheetDescription>Add a new period</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <PeriodForm 
            onSubmit={(values) => onSubmit({ 
              ...values, 
              demandCoefficient: Number(values.demandCoefficient) 
            })} 
            disabled={isPending} 
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
