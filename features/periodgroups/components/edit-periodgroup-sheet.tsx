import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeletePeriodgroup } from '@/features/periodgroups/api/use-delete-periodgroup';
import { useEditPeriodgroup } from '@/features/periodgroups/api/use-edit-periodgroup';
import { useGetPeriodgroup } from '@/features/periodgroups/api/use-get-periodgroup';
import { PeriodgroupForm } from '@/features/periodgroups/components/periodgroup-form';
import { useOpenPeriodsgroup } from '@/features/periodgroups/hooks/use-open-periodgroup';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual periodsgroup schema from your schema file


// Use the actual periodsgroup schema, omitting the id field for editing
// const formSchema = periodgroupschema.omit({ id: true });

const periodgroupschema = z.object({
  name: z.string().min(1),
});

type FormValues = z.infer<typeof periodgroupschema>;

export const EditPeriodgroupSheet = () => {
  const { isOpen, onClose, id } = useOpenPeriodsgroup();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this periodsgroup.'
  );

  const periodsgroupQuery = useGetPeriodgroup(id);
  const editMutation = useEditPeriodgroup(id);
  const deleteMutation = useDeletePeriodgroup(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    periodsgroupQuery.isLoading;

  const isLoading = periodsgroupQuery.isLoading || periodsgroupQuery.isLoading;

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

  const defaultValues = periodsgroupQuery.data
    ? {
        name: periodsgroupQuery.data.name,
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
            <SheetTitle>Edit Periodsgroup</SheetTitle>
            <SheetDescription>Edit an existing periodsgroup</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <PeriodgroupForm
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
