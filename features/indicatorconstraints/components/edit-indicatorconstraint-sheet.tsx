import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteIndicatorconstraint } from '@/features/indicatorconstraints/api/use-delete-indicatorconstraint';
import { useEditIndicatorconstraint } from '@/features/indicatorconstraints/api/use-edit-indicatorconstraint';
import { useGetIndicatorconstraint } from '@/features/indicatorconstraints/api/use-get-indicatorconstraint';
import { IndicatorconstraintForm } from '@/features/indicatorconstraints/components/indicatorconstraint-form';
import { useOpenIndicatorconstraint } from '@/features/indicatorconstraints/hooks/use-open-indicatorconstraints';
import { useGetLinearranges } from '@/features/linearranges/api/use-get-linearranges';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual indicatorconstraint schema from your schema file

// Use the actual indicatorconstraint schema, omitting the id field for editing
// const formSchema = indicatorconstraintSchema.omit({ id: true });
const indicatorconstraintSchema = z.object({
  ifConditionId: z.number().int().optional(),
  thenConditionId: z.number().int().optional(),
  inclusionType: z.boolean()
});

type FormValues = z.infer<typeof indicatorconstraintSchema>;

export const EditIndicatorconstraintSheet = () => {
  const { isOpen, onClose, id } = useOpenIndicatorconstraint();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this indicatorconstraint.'
  );

  const linearrangeQuery = useGetLinearranges();


  const linearrangeOptions = (linearrangeQuery.data ?? []).map((linearrange) => ({
    label: linearrange.name,
    value: linearrange.id
  }));

  const indicatorconstraintQuery = useGetIndicatorconstraint(id);
  const editMutation = useEditIndicatorconstraint(id);
  const deleteMutation = useDeleteIndicatorconstraint(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    indicatorconstraintQuery.isLoading;

  const isLoading = indicatorconstraintQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  const defaultValues = indicatorconstraintQuery.data
    ? {
       
      ifConditionId: indicatorconstraintQuery.data.ifConditionId,
      thenConditionId: indicatorconstraintQuery.data.thenConditionId,
      inclusionType: indicatorconstraintQuery.data.inclusionType ,
        
      }
    : {

      ifConditionId: 0,
      thenConditionId: 0,
      inclusionType: true,
     
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Indicatorconstraint</SheetTitle>
            <SheetDescription>
              Edit an existing indicatorconstraint
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <IndicatorconstraintForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              linearrangeOptions={linearrangeOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
