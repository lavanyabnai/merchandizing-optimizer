import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateProductflow } from '@/features/productflows/api/use-create-productflow';
import { ProductflowForm } from '@/features/productflows/components/productflow-form';
import { useNewProductflow } from '@/features/productflows/hooks/use-new-productflow';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';

const productflowSchema = z.object({
  label: z.string().min(1),
  sourceId: z.number(),
  destinationId: z.number(),
  vehicleTypeId: z.number(),
  productId: z.number(),
  timePeriodId: z.number(),
  fixed: z.boolean(),
  minThroughput: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  maxThroughput: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  inclusionType: z.string()
});

type FormValues = z.infer<typeof productflowSchema>;

export const NewProductflowSheet = () => {
  const { isOpen, onClose } = useNewProductflow();

  const createMutation = useCreateProductflow();

  const facilityQuery = useGetFacilities();
  const periodQuery = useGetPeriods();
  const vehicleTypeQuery = useGetVehicleTypes();
  const productQuery = useGetProducts();

  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));
  const periodOptions = (periodQuery.data ?? []).map((period) => ({
    label: period.name,
    value: period.id
  }));
  const vehicleTypeOptions = (vehicleTypeQuery.data ?? []).map(
    (vehicleType) => ({
      label: vehicleType.name,
      value: vehicleType.id
    })
  );
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));
  const isPending = createMutation.isPending;
  const isLoading =
    facilityQuery.isLoading ||
    periodQuery.isLoading ||
    vehicleTypeQuery.isLoading ||
    productQuery.isLoading;
  const onSubmit = (values: FormValues) => {
    const formattedValues = {
      ...values,
      minThroughput: values.minThroughput
        ? values.minThroughput.toString()
        : undefined,
      maxThroughput: values.maxThroughput
        ? values.maxThroughput.toString()
        : undefined
    };

    // Find the selected objects for names
    const product = productQuery.data?.find(p => p.id === values.productId);
    const period = periodQuery.data?.find(p => p.id === values.timePeriodId);
    const source = facilityQuery.data?.find(f => f.id === values.sourceId);
    const destination = facilityQuery.data?.find(f => f.id === values.destinationId);
    const vehicleType = vehicleTypeQuery.data?.find(v => v.id === values.vehicleTypeId);

    // Add required name fields for the mutation
    const mutationPayload = {
      ...formattedValues,
      productName: product?.name ?? '',
      timePeriodName: period?.name ?? '',
      sourceName: source?.name ?? '',
      destinationName: destination?.name ?? '',
      vehicleTypeName: vehicleType?.name ?? ''
    };

    createMutation.mutate(mutationPayload, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Productflow</SheetTitle>
          <SheetDescription>Add a new productflow</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <ProductflowForm
            onSubmit={onSubmit}
            disabled={isPending}
            vehicleTypeOptions={vehicleTypeOptions}
            productOptions={productOptions}
            facilityOptions={facilityOptions}
            periodOptions={periodOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
