import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateSalesbatche } from '@/features/salesbatches/api/use-create-salesbatche';
import { SalesbatcheForm } from '@/features/salesbatches/components/salesbatche-form';
import { useNewSalesbatche } from '@/features/salesbatches/hooks/use-new-salesbatche';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
// Assuming you have a schema for salesbatche, replace this with the actual schema
const salesbatchSchema = z.object({
  sourceId: z.number(),
  productId: z.number(),
  type: z.string(),
  batchSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  pricePerUnit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  currency: z.string(),
  timePeriodId: z.number().optional(),
  stepSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
});

type FormValues = z.infer<typeof salesbatchSchema>;

export const NewSalesbatcheSheet = () => {
  const { isOpen, onClose } = useNewSalesbatche();
  const createMutation = useCreateSalesbatche();

  const facilityQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  // Replace with actual mutation
  const facilityMutation = { isPending: false }; // Replace with actual mutation
  const productMutation = { isPending: false }; // Replace with actual mutation
  const timePeriodMutation = { isPending: false }; // Replace with actual mutation

  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));
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
    facilityMutation.isPending ||
    productMutation.isPending ||
    timePeriodMutation.isPending;
  const isLoading =
    facilityQuery.isLoading ||
    productQuery.isLoading ||
    timePeriodQuery.isLoading;
  
  const onSubmit = (values: FormValues) => {
    console.log('values', values);
    const transformedValues = {
      ...values,
      batchSize: values.batchSize?.toString() ?? '',
      pricePerUnit: values.pricePerUnit?.toString() ?? '',
      stepSize: values.stepSize?.toString() ?? ''
    };

    // Extract product, source, and time period names for the mutation payload
    const product = productQuery.data?.find((p) => p.id === values.productId);
    const source = facilityQuery.data?.find((f) => f.id === values.sourceId);
    const timePeriod = values.timePeriodId
      ? timePeriodQuery.data?.find((t) => t.id === values.timePeriodId)
      : undefined;

    const payload = {
      ...transformedValues,
      productName: product?.name ?? '',
      sourceName: source?.name ?? '',
      timePeriodName: timePeriod?.name ?? '',
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
          <SheetTitle>New Sales Batch</SheetTitle>
          <SheetDescription>Add a new Sales Batch</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <SalesbatcheForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilityOptions={facilityOptions}
            productOptions={productOptions}
            timePeriodOptions={timePeriodOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
