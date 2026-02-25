import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteAssetsconstraint } from '@/features/assetsconstraints/api/use-delete-assetsconstraint';
import { useEditAssetsconstraint } from '@/features/assetsconstraints/api/use-edit-assetsconstraint';
import { useGetAssetsconstraint } from '@/features/assetsconstraints/api/use-get-assetsconstraint';
import { AssetsconstraintForm } from '@/features/assetsconstraints/components/assetsconstraint-form';
import { useOpenAssetsconstraint } from '@/features/assetsconstraints/hooks/use-open-assetsconstraints';
import { useGetGroups } from '@/features/groups/api/use-get-groups';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual assetsconstraint schema from your schema file

// Use the actual assetsconstraint schema, omitting the id field for editing
// const formSchema = assetsconstraintSchema.omit({ id: true });
const assetsconstraintSchema = z.object({
  groupId: z.number().optional(),
  minDcs: z.number().optional(),
  maxDcs: z.number().optional(),
  timePeriod: z.string().optional(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']).optional()
});

type FormValues = z.infer<typeof assetsconstraintSchema>;

export const EditAssetsconstraintSheet = () => {
  const { isOpen, onClose, id } = useOpenAssetsconstraint();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this assetsconstraint.'
  );

  const groupQuery = useGetGroups();
  // const groupMutation = { isPending: false };

  const groupOptions = (groupQuery.data ?? []).map((group) => ({
    label: group.name,
    value: group.id
  }));

  const assetsconstraintQuery = useGetAssetsconstraint(id);
  const editMutation = useEditAssetsconstraint(id);
  const deleteMutation = useDeleteAssetsconstraint(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    assetsconstraintQuery.isLoading;

  const isLoading = assetsconstraintQuery.isLoading;

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

  const defaultValues = assetsconstraintQuery.data
    ? {
       
        groupId: assetsconstraintQuery.data.groupId,
        minDcs: assetsconstraintQuery.data.minDcs ?? undefined,
        maxDcs: assetsconstraintQuery.data.maxDcs ?? undefined,
        timePeriod: assetsconstraintQuery.data.timePeriod ?? undefined,
        inclusionType: assetsconstraintQuery.data.inclusionType as
          | 'Include'
          | 'Exclude'
          | 'Consider'
      }
    : {

        minDcs: 0,
        maxDcs: 0,
        timePeriod: '',
        inclusionType: 'Consider' as const
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Assetsconstraint</SheetTitle>
            <SheetDescription>
              Edit an existing assetsconstraint
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <AssetsconstraintForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              groupOptions={groupOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
