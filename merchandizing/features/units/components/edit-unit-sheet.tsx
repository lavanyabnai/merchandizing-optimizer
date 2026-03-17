import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteUnit } from '@/features/units/api/use-delete-unit';
import { useEditUnit } from '@/features/units/api/use-edit-unit';
import { useGetUnit } from '@/features/units/api/use-get-unit';
import { UnitForm } from '@/features/units/components/unit-form';
import { useOpenUnit } from '@/features/units/hooks/use-open-unit';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual unit schema from your schema file


// Use the actual unit schema, omitting the id field for editing
// const formSchema = unitSchema.omit({ id: true });

const unitSchema = z.object({
  name: z.string().min(1),
});

type FormValues = z.infer<typeof unitSchema>;

export const EditUnitSheet = () => {
  const { isOpen, onClose, id } = useOpenUnit();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this unit.'
  );

  const unitQuery = useGetUnit(id);
  const editMutation = useEditUnit(id);
  const deleteMutation = useDeleteUnit(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    unitQuery.isLoading;

  const isLoading = unitQuery.isLoading || unitQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    // console.log('Submitting values:', values); // Add this line
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

  const defaultValues = unitQuery.data
    ? {
        name: unitQuery.data.name,
      }
    : {
        name: '',
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Unit</SheetTitle>
            <SheetDescription>Edit an existing unit</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <UnitForm
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
