import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateProductgroup } from '@/features/productgroups/api/use-create-productgroup';
import { useGetProductgroups } from '@/features/productgroups/api/use-get-productgroups';
import { ProductgroupForm } from '@/features/productgroups/components/productgroup-form';
import { useNewProductgroup } from '@/features/productgroups/hooks/use-new-productgroup';

// Assuming you have a schema for productgroup, replace this with the actual schema
const productgroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),

});

type FormValues = z.infer<typeof productgroupSchema>;

export const NewProductgroupSheet = () => {
  const { isOpen, onClose } = useNewProductgroup();

  const createMutation = useCreateProductgroup();

  // Placeholder for useProductgroup hook
  const productgroupQuery = useGetProductgroups();
  const productgroupMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateProductgroup = (name: string) => {
  //   // Implement productgroup creation logic
  // };

  const isPending = createMutation.isPending || productgroupMutation.isPending;
  const isLoading = productgroupQuery.isLoading;

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
          <SheetTitle>New Productgroup</SheetTitle>
          <SheetDescription>Add a new productgroup</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <ProductgroupForm onSubmit={onSubmit} disabled={isPending} />
        )}
      </SheetContent>
    </Sheet>
  );
};
