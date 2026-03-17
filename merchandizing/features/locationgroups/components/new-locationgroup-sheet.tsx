import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateLocationgroup } from '@/features/locationgroups/api/use-create-locationgroup';
import { useGetLocationgroups } from '@/features/locationgroups/api/use-get-locationgroups';
import { LocationgroupForm } from '@/features/locationgroups/components/locationgroup-form';
import { useNewLocationgroup } from '@/features/locationgroups/hooks/use-new-locationgroup';

const locationgroupSchema = z.object({
  name: z.string().min(1, 'Name is required')
});

type FormValues = z.infer<typeof locationgroupSchema>;

export const NewLocationgroupSheet = () => {
  const { isOpen, onClose } = useNewLocationgroup();

  const createMutation = useCreateLocationgroup();

  // Placeholder for useLocationgroup hook
  const locationgroupQuery = useGetLocationgroups();
  const locationgroupMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateLocationgroup = (name: string) => {
  //   // Implement locationgroup creation logic
  // };

  const isPending = createMutation.isPending || locationgroupMutation.isPending;
  const isLoading = locationgroupQuery.isLoading;

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
          <SheetTitle>New Locationgroup</SheetTitle>
          <SheetDescription>Add a new locationgroup</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <LocationgroupForm
            onSubmit={onSubmit}
            disabled={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
