import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateBom } from '@/features/boms/api/use-create-bom';
import { BomForm } from '@/features/boms/components/bom-form';
import { useNewBom } from '@/features/boms/hooks/use-new-bom';
import { useGetProducts } from '@/features/products/api/use-get-products';

// Assuming you have a schema for bom, replace this with the actual schema
const bomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  endProductId: z.number().int().positive('End Product is required'),
  quantity: z.string().optional()
    .transform((val) => (val ? parseInt(val) : undefined))
});

type FormValues = z.infer<typeof bomSchema>;

export const NewBomSheet = () => {
  const { isOpen, onClose } = useNewBom();
  const createMutation = useCreateBom();

  // Placeholder for useLocation hook
  const productQuery = useGetProducts();
  // const productMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateLocation = (name: string) => {
  //   // Implement location creation logic
  // };
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));

  const isPending = createMutation.isPending;
  const isLoading = productQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      ...values,
      quantity: values.quantity?.toString() ?? '',
      endProductName: ''
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Bom</SheetTitle>
          <SheetDescription>Add a new bom</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <BomForm
            onSubmit={onSubmit}
            disabled={isPending}
            productOptions={productOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
