import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateProduct } from '@/features/products/api/use-create-product';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { ProductForm } from '@/features/products/components/product-form';
import { useNewProduct } from '@/features/products/hooks/use-new-product';

// Assuming you have a schema for product, replace this with the actual schema
const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  unit: z.string().min(1, 'Unit is required'),
  sellingPrice: z
    .string()
    .transform((val) => (val ? parseInt(val) : undefined)),
  cost: z.string().transform((val) => (val ? parseInt(val) : undefined)),
  currency: z.string().min(1, 'Currency is required')
});

type FormValues = z.infer<typeof productSchema>;

export const NewProductSheet = () => {
  const { isOpen, onClose } = useNewProduct();

  const createMutation = useCreateProduct();

  // Placeholder for useProduct hook
  const productQuery = useGetProducts();
  const productMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateProduct = (name: string) => {
  //   // Implement product creation logic
  // };

  const isPending = createMutation.isPending || productMutation.isPending;
  const isLoading = productQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      ...values,
      sellingPrice: values.sellingPrice || 0,
      cost: values.cost || 0
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
          <SheetTitle>New Product</SheetTitle>
          <SheetDescription>Add a new product</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <ProductForm onSubmit={onSubmit} disabled={isPending} />
        )}
      </SheetContent>
    </Sheet>
  );
};
