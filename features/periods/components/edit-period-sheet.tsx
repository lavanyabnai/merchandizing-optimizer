import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeletePeriod } from '@/features/periods/api/use-delete-period';
import { useEditPeriod } from '@/features/periods/api/use-edit-period';
import { useGetPeriod } from '@/features/periods/api/use-get-period';
import { PeriodForm } from '@/features/periods/components/period-form';
import { useOpenPeriod } from '@/features/periods/hooks/use-open-period';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual period schema from your schema file


// Use the actual period schema, omitting the id field for editing
// const formSchema = periodSchema.omit({ id: true });
const periodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  start: z.string().min(1, 'Start is required'),
  end: z.string().min(1, 'End is required'),
  demandCoefficient: z.string().min(1, 'Demand Coefficient is required')
});

type FormValues = z.infer<typeof periodSchema>;

export const EditPeriodSheet = () => {
  const { isOpen, onClose, id } = useOpenPeriod();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this period.'
  );

  const periodQuery = useGetPeriod(id);
  const editMutation = useEditPeriod(id);
  const deleteMutation = useDeletePeriod(id);

  const isPending =
    editMutation.isPending || deleteMutation.isPending || periodQuery.isLoading;

  const isLoading = periodQuery.isLoading || periodQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    // console.log('Submitting values:', values); // Add this line
    const updatedValues = {
      ...values,
      demandCoefficient: Number(values.demandCoefficient)
    };
    editMutation.mutate(updatedValues, {
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

  const defaultValues = periodQuery.data
    ? {
        name: periodQuery.data.name,
        start: periodQuery.data.start,
        end: periodQuery.data.end,
        demandCoefficient: periodQuery.data.demandCoefficient
      }
    : {
        name: '',
        start: '',
        end: '',
        demandCoefficient: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Period</SheetTitle>
            <SheetDescription>Edit an existing period</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <PeriodForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
