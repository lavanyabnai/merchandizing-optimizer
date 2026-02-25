import { Loader2 } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateBomcomponent } from '@/features/bomcomponents/api/use-create-bomcomponent';
import { BomComponentForm } from '@/features/bomcomponents/components/bomcomponent-form';
import { useNewBomcomponent } from '@/features/bomcomponents/hooks/use-new-bomcomponent';
import { useGetBomcomponents } from '@/features/bomcomponents/api/use-get-bomcomponents';
import { useGetProducts } from '@/features/products/api/use-get-products';

// Assuming you have a schema for bomcomponent, replace this with the actual schema
// const bomcomponentSchema = z.object({
//   bomcomponentId: z.number().int().positive('Bomcomponent is required'),
//   productId: z.number().int().positive('Product is required'),
//   quantity: z
//     .string()
//     .optional()
//     .transform((val) => (val ? parseInt(val) : undefined))
// });


export const NewBomcomponentSheet = () => {
  const { isOpen, onClose } = useNewBomcomponent();
  const createMutation = useCreateBomcomponent();

  const productQuery = useGetProducts();

  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));
  const bomcomponentQuery = useGetBomcomponents();
  const bomOptions = (bomcomponentQuery.data ?? []).map((bom: { bomName: string; id: number }) => ({
    label: bom.bomName,
    value: bom.id
  }));

  const isPending = createMutation.isPending;
  const isLoading = productQuery.isLoading;

  const onSubmit = (values: { productId: number; bomId: number; quantity?: number }) => {
    createMutation.mutate({
      bomId: values.bomId,
      productId: values.productId,
      quantity: values.quantity?.toString() ?? "0",
      productName: '',
      bomName: ''
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
          <SheetTitle>New Bomcomponent</SheetTitle>
          <SheetDescription>Add a new bomcomponent</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <BomComponentForm
            onSubmit={onSubmit}
            disabled={isPending}
            productOptions={productOptions}
            bomOptions={bomOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
