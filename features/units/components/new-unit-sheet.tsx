import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateUnit } from '@/features/units/api/use-create-unit';
import { useGetUnits } from '@/features/units/api/use-get-units';
import { UnitForm } from '@/features/units/components/unit-form';
import { useNewUnit } from '@/features/units/hooks/use-new-unit';

// Assuming you have a schema for unit, replace this with the actual schema

const unitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof unitSchema>;

export const NewUnitSheet = () => {
  const { isOpen, onClose } = useNewUnit();

  const createMutation = useCreateUnit();

  // Placeholder for useUnit hook
  const unitQuery = useGetUnits();
  const unitMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateUnit = (name: string) => {
  //   // Implement unit creation logic
  // };

  const isPending = createMutation.isPending || unitMutation.isPending;
  const isLoading = unitQuery.isLoading;

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
          <SheetTitle>New Unit</SheetTitle>
          <SheetDescription>Add a new unit</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <UnitForm
            onSubmit={onSubmit}
            disabled={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
