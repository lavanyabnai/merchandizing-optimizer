import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeletecustomconstraint } from '@/features/customconstraints/api/use-delete-customconstraint';
import { useEditcustomconstraint } from '@/features/customconstraints/api/use-edit-customconstraint';
import { useGetcustomconstraint } from '@/features/customconstraints/api/use-get-customconstraint';
import { CustomconstraintForm } from '@/features/customconstraints/components/customconstraint-form';
import { useOpencustomconstraint } from '@/features/customconstraints/hooks/use-open-customconstraints';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual customconstraint schema from your schema file

// Use the actual customconstraint schema, omitting the id field for editing
// const formSchema = customconstraintSchema.omit({ id: true });
const customconstraintSchema = z.object({
  leftHandSide: z.string().optional(),
  comparisonType: z.string().optional(),
  rightHandSide: z.string().optional(),
  constraintType: z.string().optional(),
 
});

type FormValues = z.infer<typeof customconstraintSchema>;

export const EditcustomconstraintSheet = () => {
  const { isOpen, onClose, id } = useOpencustomconstraint();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this customconstraint.'
  );

  const customconstraintQuery = useGetcustomconstraint(id);
  const editMutation = useEditcustomconstraint(id);
  const deleteMutation = useDeletecustomconstraint(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    customconstraintQuery.isLoading;

  const isLoading = customconstraintQuery.isLoading;

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

  const defaultValues = customconstraintQuery.data
    ? {
        leftHandSide: customconstraintQuery.data.leftHandSide ?? undefined,
        comparisonType: customconstraintQuery.data.comparisonType ?? undefined,
        rightHandSide: customconstraintQuery.data.rightHandSide ?? undefined,
        constraintType: customconstraintQuery.data.constraintType ?? undefined
      }
    : {
        leftHandSide: '',
        comparisonType: '',
        rightHandSide: '',
        constraintType: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Custom Constraint</SheetTitle>
            <SheetDescription>
              Edit an Existing Custom Constraint
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <CustomconstraintForm
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
}