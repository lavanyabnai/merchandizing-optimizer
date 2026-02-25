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
import { useCreateShipping } from '@/features/shipping/api/use-create-shipping';
import { ShippingForm } from '@/features/shipping/components/shipping-form';
import { useNewShipping } from '@/features/shipping/hooks/use-new-shipping';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';
// Assuming you have a schema for shipping, replace this with the actual schema

const shippingSchema = z.object({
  sourceId: z.number().int().positive(),  
  destinationId: z.number().int().positive(),
  productId: z.number().int().positive(),
  vehicleTypeId: z.number().int().positive(),
  type: z.string(),
  priority: z.string(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']),
  timePeriodId: z.number().int().positive(),
});

type FormValues = z.infer<typeof shippingSchema>;

export const NewShippingSheet = () => {
  const { isOpen, onClose } = useNewShipping();
  const createMutation = useCreateShipping();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  const vehicleTypeQuery = useGetVehicleTypes();
  // Replace with actual mutation
  const facilitieMutation = { isPending: false }; // Replace with actual mutation
  const productMutation = { isPending: false }; // Replace with actual mutation
  const timePeriodMutation = { isPending: false };
  const vehicleTypeMutation = { isPending: false };

  const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
    label: facilitie.name,
    value: facilitie.id
  }));
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));
  const timePeriodOptions = (timePeriodQuery.data ?? []).map((timePeriod) => ({
    label: timePeriod.name,
    value: timePeriod.id
  }));
  const vehicleTypeOptions = (vehicleTypeQuery.data ?? []).map((vehicleType) => ({
    label: vehicleType.name,
    value: vehicleType.id
  }));

  const isPending =
    createMutation.isPending ||
    facilitieMutation.isPending ||
    productMutation.isPending ||
    timePeriodMutation.isPending ||
    vehicleTypeMutation.isPending;
  const isLoading =
    facilitieQuery.isLoading ||
    productQuery.isLoading ||
    timePeriodQuery.isLoading ||
    vehicleTypeQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      ...values,
      inclusionType: values.inclusionType as 'Include' | 'Exclude' | 'Consider',
      productName: '',
      timePeriodName: '',
      sourceName: '',
      destinationName: '',
      vehicleTypeName: ''
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
          <SheetTitle>New Shipping</SheetTitle>
          <SheetDescription>Add a new shipping</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <ShippingForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilitieOptions={facilitieOptions}
            productOptions={productOptions}
            timePeriodOptions={timePeriodOptions}
            vehicleTypeOptions={vehicleTypeOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
