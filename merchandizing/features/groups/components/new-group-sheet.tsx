import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateGroup } from '@/features/groups/api/use-create-group';
import { useGetGroups } from '@/features/groups/api/use-get-groups';
import { GroupForm } from '@/features/groups/components/group-form';
import { useNewGroup } from '@/features/groups/hooks/use-new-group';

// Assuming you have a schema for group, replace this with the actual schema

const groupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional()
});

type FormValues = z.infer<typeof groupSchema>;

export const NewGroupSheet = () => {
  const { isOpen, onClose } = useNewGroup();

  const createMutation = useCreateGroup();

  // Placeholder for useGroup hook
  const groupQuery = useGetGroups();
  const groupMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateGroup = (name: string) => {
  //   // Implement group creation logic
  // };

  const isPending = createMutation.isPending || groupMutation.isPending;
  const isLoading = groupQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Group</SheetTitle>
          <SheetDescription>Add a new group</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <GroupForm
            onSubmit={onSubmit}
            disabled={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
