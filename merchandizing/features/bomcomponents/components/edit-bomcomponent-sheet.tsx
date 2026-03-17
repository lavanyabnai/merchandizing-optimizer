import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteBomcomponent } from '@/features/bomcomponents/api/use-delete-bomcomponent';
import { useEditBomcomponent } from '@/features/bomcomponents/api/use-edit-bomcomponent';
import { useGetBomcomponents } from '@/features/bomcomponents/api/use-get-bomcomponents';
import { BomComponentForm } from '@/features/bomcomponents/components/bomcomponent-form';
import { useOpenBomcomponent } from '@/features/bomcomponents/hooks/use-open-bomcomponent';
import { useGetProducts } from '@/features/products/api/use-get-products';


import { useConfirm } from '@/hooks/use-confirm';

// Define the bomcomponent schema
const bomcomponentSchema = z.object({
  bomcomponentId: z.number().int().positive('Bomcomponent is required'),
  productId: z.number().int().positive('Product is required'),
  quantity: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
});

type FormValues = z.infer<typeof bomcomponentSchema>;

export const EditBomcomponentSheet = () => {
  const { isOpen, onClose, id } = useOpenBomcomponent();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this bomcomponent.'
  );

  const bomcomponentQuery = useGetBomcomponents();
  const editMutation = useEditBomcomponent(id);
  const deleteMutation = useDeleteBomcomponent(id);

  const productQuery = useGetProducts();
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));

  const bomOptions = (bomcomponentQuery.data ?? []).map((bomcomponent) => ({
    label: bomcomponent.bomName,
    value: bomcomponent.id
  }));

  const isPending =
    editMutation.isPending || deleteMutation.isPending || bomcomponentQuery.isLoading;

  const isLoading = bomcomponentQuery.isLoading || productQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    editMutation.mutate({
      bomId: values.bomcomponentId,
      productId: values.productId,
      quantity: values.quantity?.toString() ?? "0"
    }, {
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

  const defaultValues = bomcomponentQuery.data
    ? {
        bomcomponentId: bomcomponentQuery.data[0].id,
        productId: bomcomponentQuery.data[0].productId,
        quantity: bomcomponentQuery.data[0].quantity
      }
    : {
        bomcomponentId: 0,
        productId: 0,
        quantity: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Bomcomponent</SheetTitle>
            <SheetDescription>Edit an existing bomcomponent</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <BomComponentForm
              id={Number(id) || undefined}
              defaultValues={{
                bomId: defaultValues.bomcomponentId,
                productId: defaultValues.productId,
                quantity: typeof defaultValues.quantity === 'string' ? Number(defaultValues.quantity) : defaultValues.quantity
              }}
              onSubmit={(values) => onSubmit({
                bomcomponentId: values.bomId,
                productId: values.productId,
                quantity: values.quantity
              })}
              onDelete={onDelete}
              disabled={isPending}
              productOptions={productOptions}
              bomOptions={bomOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
