import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useCreateOrderingrule } from '@/features/orderingrules/api/use-create-orderingrule';
import { OrderingruleForm } from '@/features/orderingrules/components/orderingrule-form';
import { useNewOrderingrule } from '@/features/orderingrules/hooks/use-new-orderingrule';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
// import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';


const orderingruleSchema = z.object({
  destinationId: z.number().int().positive(),
  productId: z.number().int().positive(),
  rule: z.string(),
  limitUnits: z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined))
});

type FormValues = z.infer<typeof orderingruleSchema>;

export const NewOrderingruleSheet = () => {
  const { isOpen, onClose } = useNewOrderingrule();
  const createMutation = useCreateOrderingrule();


  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();

  // Replace with actual mutation
  const facilitieMutation = { isPending: false }; 
  const productMutation = { isPending: false };

  const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
    label: facilitie.name,
    value: facilitie.id
  }));
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));
  

  const isPending =
    createMutation.isPending ||
    facilitieMutation.isPending ||
    productMutation.isPending;
  const isLoading =
    facilitieQuery.isLoading ||
    productQuery.isLoading ;

  const onSubmit = (values: FormValues) => {
    console.log(`Form values: ${JSON.stringify(values)}`);
    createMutation.mutate({
      ...values,
      limitUnits: values.limitUnits ?? 0,
      productName: '',
      destinationName: ''
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
          <SheetTitle>New Orderingrule</SheetTitle>
          <SheetDescription>Add a new orderingrule</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <OrderingruleForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilitieOptions={facilitieOptions}
            productOptions={productOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
