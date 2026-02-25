import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

import { useCreateSourcing } from '@/features/sourcing/api/use-create-sourcing';
import { SourcingForm } from '@/features/sourcing/components/sourcing-form';
import { useNewSourcing } from '@/features/sourcing/hooks/use-new-sourcing';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';

// Assuming you have a schema for sourcing, replace this with the actual schema

const sourcingSchema = z.object({
  deliveryDestination: z.string(),
  productId: z.number().int().positive(),
  type: z.string(),
  timePeriodId: z.number().int().positive(),
  inclusionType: z.string(),

});

type FormValues = z.infer<typeof sourcingSchema>;

export const NewSourcingSheet = () => {
  const { isOpen, onClose } = useNewSourcing();
  const createMutation = useCreateSourcing();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  // Replace with actual mutation
  const productMutation = { isPending: false }; // Replace with actual mutation
  const timePeriodMutation = { isPending: false }; // Replace with actual mutation

  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));
  const timePeriodOptions = (timePeriodQuery.data ?? []).map((timePeriod) => ({
    label: timePeriod.name,
    value: timePeriod.id
  }));

  const isPending =
    createMutation.isPending ||
    productMutation.isPending ||
    timePeriodMutation.isPending;
  const isLoading =
    productQuery.isLoading ||
    timePeriodQuery.isLoading;

    const onSubmit = (values: FormValues) => {
      console.log('edit sourcing form', values);

      // Find product and time period names based on selected IDs
      const selectedProduct = productOptions.find(p => p.value === values.productId);
      const selectedTimePeriod = timePeriodOptions.find(tp => tp.value === values.timePeriodId);

      // Compose the payload to match the expected mutation input
      const payload = {
        ...values,
        productName: selectedProduct ? selectedProduct.label : '',
        timePeriodName: selectedTimePeriod ? selectedTimePeriod.label : '',
      };

      createMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
        }
      });
    };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Sourcing</SheetTitle>
          <SheetDescription>Add a New Sourcing</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <SourcingForm
            onSubmit={onSubmit}
            disabled={isPending}
            productOptions={productOptions}
            timePeriodOptions={timePeriodOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
