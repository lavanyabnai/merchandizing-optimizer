import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateAssetsconstraint } from '@/features/assetsconstraints/api/use-create-assetsconstraint';
import { AssetsconstraintForm } from '@/features/assetsconstraints/components/assetsconstraint-form';
import { useNewAssetsconstraint } from '@/features/assetsconstraints/hooks/use-new-assetsconstraint';
import { useGetGroups } from '@/features/groups/api/use-get-groups';
// Assuming you have a schema for assetsconstraint, replace this with the actual schema
const assetsconstraintSchema = z.object({
  groupId: z.number().optional(),
  minDcs: z.number().optional(),
  maxDcs: z.number().optional(),
  timePeriod: z.string().optional(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']).optional()
});

type FormValues = z.infer<typeof assetsconstraintSchema>;

export const NewAssetsconstraintSheet = () => {
  const { isOpen, onClose } = useNewAssetsconstraint();
  const createMutation = useCreateAssetsconstraint();

  const groupQuery = useGetGroups();
  const groupMutation = { isPending: false };

  const groupOptions = (groupQuery.data ?? []).map((group) => ({
    label: group.name,
    value: group.id
  }));

  const isPending = createMutation.isPending || groupMutation.isPending;
  const isLoading = groupQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    // Find the group name based on the selected groupId
    const group = groupOptions.find((g) => g.value === values.groupId);
    const groupName = group ? group.label : '';

    // Prepare the payload to match the required type
    createMutation.mutate(
      {
        groupId: values.groupId!,
        groupName,
        minDcs: values.minDcs ?? null,
        maxDcs: values.maxDcs ?? null,
        timePeriod: values.timePeriod ?? null,
        inclusionType: values.inclusionType ?? null
      },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Assetsconstraint</SheetTitle>
          <SheetDescription>Add a new assetsconstraint</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <AssetsconstraintForm onSubmit={onSubmit} disabled={isPending} groupOptions={groupOptions} />
        )}
      </SheetContent>
    </Sheet>
  );
};
