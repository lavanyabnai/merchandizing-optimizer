import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateUnitconversion } from '@/features/unitconversions/api/use-create-unitconversion';
import { UnitconversionForm } from '@/features/unitconversions/components/unitconversion-form';
import { useNewUnitconversion } from '@/features/unitconversions/hooks/use-new-unitconversion';
import { useGetProducts } from '@/features/products/api/use-get-products';
// Assuming you have a schema for unitconversion, replace this with the actual schema
const unitconversionSchema = z.object({
  productId: z.number().optional(),
  amountFrom:z
  .string()
  .transform((val) => (val ? parseInt(val) : 0)),
  unitFrom: z.string().optional(),
  amountTo: z
  .string()
  .transform((val) => (val ? parseInt(val) : 0)),
  unitTo: z.string().optional()
});

type FormValues = z.infer<typeof unitconversionSchema>;

export const NewUnitconversionSheet = () => {
  const { isOpen, onClose } = useNewUnitconversion();
  const createMutation = useCreateUnitconversion();

  const productQuery = useGetProducts();
  const productMutation = { isPending: false };

  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));

  const isPending = createMutation.isPending || productMutation.isPending;
  const isLoading = productQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const formattedValues = {
      productId: values.productId,
      amountFrom: values.amountFrom.toString(),
      amountTo: values.amountTo.toString(),
      unitFrom: values.unitFrom ?? '',
      unitTo: values.unitTo ?? '',
      productName: productOptions.find(option => option.value === values.productId)?.label ?? ''
    };
    createMutation.mutate(formattedValues, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Unitconversion</SheetTitle>
          <SheetDescription>Add a new unitconversion</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <UnitconversionForm 
           onSubmit={onSubmit}
           disabled={isPending} 
           productOptions={productOptions} />
        )}
      </SheetContent>
    </Sheet>
  );
};
