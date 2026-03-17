import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteBom } from '@/features/boms/api/use-delete-bom';
import { useEditBom } from '@/features/boms/api/use-edit-bom';
import { useGetBom } from '@/features/boms/api/use-get-bom';
import { BomForm } from '@/features/boms/components/bom-form';
import { useOpenBom } from '@/features/boms/hooks/use-open-bom';
import { useGetProducts } from '@/features/products/api/use-get-products';

import { useConfirm } from '@/hooks/use-confirm';

// Define the bom schema
const bomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  endProductId: z.number().int().positive('End Product is required'),
  quantity: z.string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
});

type FormValues = z.infer<typeof bomSchema>;

export const EditBomSheet = () => {
  const { isOpen, onClose, id } = useOpenBom();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this bom.'
  );

  const bomQuery = useGetBom(id);
  const editMutation = useEditBom(id);
  const deleteMutation = useDeleteBom(id);

  const productQuery = useGetProducts();
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));

  const isPending =
    editMutation.isPending || deleteMutation.isPending || bomQuery.isLoading;

  const isLoading = bomQuery.isLoading || productQuery.isLoading;

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

  const defaultValues = bomQuery.data
    ? {
        name: bomQuery.data.name,
        endProductId: bomQuery.data.endProductId,
        quantity: bomQuery.data.quantity
      }
    : {
        name: '',
        endProductId: 0,
        quantity: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Bom</SheetTitle>
            <SheetDescription>Edit an existing bom</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <BomForm
              id={Number(id) || undefined}
              defaultValues={{
                ...defaultValues,
                quantity: typeof defaultValues.quantity === 'string' ? Number(defaultValues.quantity) : defaultValues.quantity
              }}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              productOptions={productOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
