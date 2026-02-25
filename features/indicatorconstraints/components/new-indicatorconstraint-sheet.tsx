import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateIndicatorconstraint } from '@/features/indicatorconstraints/api/use-create-indicatorconstraint';
import { IndicatorconstraintForm } from '@/features/indicatorconstraints/components/indicatorconstraint-form';
import { useNewIndicatorconstraint } from '@/features/indicatorconstraints/hooks/use-new-indicatorconstraint';
import { useGetLinearranges } from '@/features/linearranges/api/use-get-linearranges';
// Assuming you have a schema for indicatorconstraint, replace this with the actual schema
const indicatorconstraintSchema = z.object({
  ifConditionId: z.number().int().optional(),
  thenConditionId: z.number().int().optional(),
  inclusionType: z.boolean()
});

type FormValues = z.infer<typeof indicatorconstraintSchema>;

export const NewIndicatorconstraintSheet = () => {
  const { isOpen, onClose } = useNewIndicatorconstraint();
  const createMutation = useCreateIndicatorconstraint();

  const linearrangeQuery = useGetLinearranges();
  const linearrangeMutation = { isPending: false };

  const linearrangeOptions = (linearrangeQuery.data ?? []).map((linearrange) => ({
    label: linearrange.name,
    value: linearrange.id
  }));

  const isPending = createMutation.isPending || linearrangeMutation.isPending;
  const isLoading = linearrangeQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const formattedValues = {
      ...values,
      ifConditionId: values.ifConditionId ? values.ifConditionId : 0,
      thenConditionId: values.thenConditionId ? values.thenConditionId : 0,
      inclusionType: values.inclusionType,
      ifConditionName: '',
      thenConditionName: ''
    };
    createMutation.mutate(formattedValues, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Indicatorconstraint</SheetTitle>
          <SheetDescription>Add a new indicatorconstraint</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <IndicatorconstraintForm onSubmit={onSubmit} disabled={isPending} linearrangeOptions={linearrangeOptions} />
        )}
      </SheetContent>
    </Sheet>
  );
};
