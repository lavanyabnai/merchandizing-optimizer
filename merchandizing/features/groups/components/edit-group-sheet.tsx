import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteGroup } from '@/features/groups/api/use-delete-group';
import { useEditGroup } from '@/features/groups/api/use-edit-group';
import { useGetGroup } from '@/features/groups/api/use-get-group';
import { GroupForm } from '@/features/groups/components/group-form';
import { useOpenGroup } from '@/features/groups/hooks/use-open-group';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual group schema from your schema file


// Use the actual group schema, omitting the id field for editing
// const formSchema = groupSchema.omit({ id: true });

const groupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

type FormValues = z.infer<typeof groupSchema>;

export const EditGroupSheet = () => {
  const { isOpen, onClose, id } = useOpenGroup();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this group.'
  );

  const groupQuery = useGetGroup(id);
  const editMutation = useEditGroup(id);
  const deleteMutation = useDeleteGroup(id);

  const isPending =
    editMutation.isPending || deleteMutation.isPending || groupQuery.isLoading;

  const isLoading = groupQuery.isLoading || groupQuery.isLoading;

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

  const defaultValues = groupQuery.data
    ? {
        name: groupQuery.data.name,
        description: groupQuery.data.description ?? undefined // Ensure it's a string
      }
    : {
        name: '',
        description: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Group</SheetTitle>
            <SheetDescription>Edit an existing group</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <GroupForm
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
