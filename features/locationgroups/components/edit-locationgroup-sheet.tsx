import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteLocationgroup } from '@/features/locationgroups/api/use-delete-locationgroup';
import { useEditLocationgroup } from '@/features/locationgroups/api/use-edit-locationgroup';
import { useGetLocationgroup } from '@/features/locationgroups/api/use-get-locationgroup';
import { LocationgroupForm } from '@/features/locationgroups/components/locationgroup-form';
import { useOpenLocationgroup } from '@/features/locationgroups/hooks/use-open-locationgroup';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual locationgroup schema from your schema file


// Use the actual locationgroup schema, omitting the id field for editing
// const formSchema = locationgroupSchema.omit({ id: true });

const locationgroupSchema = z.object({
  name: z.string().min(1)
});

type FormValues = z.infer<typeof locationgroupSchema>;

export const EditLocationgroupSheet = () => {
  const { isOpen, onClose, id } = useOpenLocationgroup();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this locationgroup.'
  );

  const locationgroupQuery = useGetLocationgroup(id);
  const editMutation = useEditLocationgroup(id);
  const deleteMutation = useDeleteLocationgroup(id);

  const isPending =
    editMutation.isPending || deleteMutation.isPending || locationgroupQuery.isLoading;

  const isLoading = locationgroupQuery.isLoading || locationgroupQuery.isLoading;

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

  const defaultValues = locationgroupQuery.data
    ? {
        name: locationgroupQuery.data.name
      }
    : {
        name: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Locationgroup</SheetTitle>
            <SheetDescription>Edit an existing locationgroup</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <LocationgroupForm
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
