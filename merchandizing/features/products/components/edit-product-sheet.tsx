import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteProduct } from '@/features/products/api/use-delete-product';
import { useEditProduct } from '@/features/products/api/use-edit-product';
import { useGetProduct } from '@/features/products/api/use-get-product';
import { ProductForm } from '@/features/products/components/product-form';
import { useOpenProduct } from '@/features/products/hooks/use-open-product';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual product schema from your schema file


// Use the actual product schema, omitting the id field for editing
// const formSchema = productSchema.omit({ id: true });
const productSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  sellingPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  cost: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  currency: z.string().min(1)
});

type FormValues = z.infer<typeof productSchema>;

export const EditProductSheet = () => {
  const { isOpen, onClose, id } = useOpenProduct();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this product.'
  );

  const productQuery = useGetProduct(id);
  const editMutation = useEditProduct(id);
  const deleteMutation = useDeleteProduct(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    productQuery.isLoading;

  const isLoading = productQuery.isLoading || productQuery.isLoading;

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

  const defaultValues = productQuery.data
    ? {
        name: productQuery.data.name,
        unit: productQuery.data.unit,
        sellingPrice: productQuery.data.sellingPrice ?? undefined, // Ensure it's a number
        cost: productQuery.data.cost ?? undefined, // Ensure it's a number
        currency: productQuery.data.currency
      }
    : {
        name: '',
        unit: '',
        sellingPrice: undefined,
        cost: undefined,
        currency: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Product</SheetTitle>
            <SheetDescription>Edit an existing product</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <ProductForm
              id={Number(id) || undefined}
              defaultValues={{
                ...defaultValues,
                sellingPrice: defaultValues.sellingPrice !== undefined && defaultValues.sellingPrice !== null
                  ? Number(defaultValues.sellingPrice)
                  : undefined,
                cost: defaultValues.cost !== undefined && defaultValues.cost !== null
                  ? Number(defaultValues.cost)
                  : undefined,
              }}
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
