import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteShipping } from '@/features/shipping/api/use-delete-shipping';
import { useEditShipping } from '@/features/shipping/api/use-edit-shipping';
import { useGetShipping } from '@/features/shipping/api/use-get-shipping';
import { ShippingForm } from '@/features/shipping/components/shipping-form';
import { useOpenShipping } from '@/features/shipping/hooks/use-open-shipping';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual shipping schema from your schema file


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

export const EditShippingSheet = () => {
  const { isOpen, onClose, id } = useOpenShipping();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  const vehicleTypeQuery = useGetVehicleTypes();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this shipping.'
  );

  const shippingQuery = useGetShipping(id);
  const editMutation = useEditShipping(id);
  const deleteMutation = useDeleteShipping(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    shippingQuery.isLoading ||
    vehicleTypeQuery.isLoading;

  const isLoading =
    shippingQuery.isLoading ||
    !shippingQuery.data;

 

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
  const onSubmit = (values: FormValues) => {
    console.log('edit shipping form', values);
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

  const defaultValues = shippingQuery.data
    ? {
        sourceId: shippingQuery.data.sourceId,
        destinationId: shippingQuery.data.destinationId,
        productId: shippingQuery.data.productId,
        vehicleTypeId: shippingQuery.data.vehicleTypeId,
        type: shippingQuery.data.type,
        priority: shippingQuery.data.priority,
        inclusionType: shippingQuery.data.inclusionType as 'Include' | 'Exclude' | 'Consider',
        timePeriodId: shippingQuery.data.timePeriodId,
      }
    : {
        sourceId: 0,
        destinationId: 0,
        productId: 0,
        vehicleTypeId: 0,
        type: '',
        priority: '',
        inclusionType: 'Include' as const,
        timePeriodId: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Shipping</SheetTitle>
            <SheetDescription>Edit an existing shipping</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <ShippingForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilitieOptions={facilitieOptions}
              productOptions={productOptions}
              timePeriodOptions={timePeriodOptions}
              vehicleTypeOptions={vehicleTypeOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}