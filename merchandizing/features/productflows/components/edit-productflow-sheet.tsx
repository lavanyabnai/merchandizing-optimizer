import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

import { useDeleteProductflow } from '@/features/productflows/api/use-delete-productflow';
import { useEditProductflow } from '@/features/productflows/api/use-edit-productflow';
import { useGetProductflow } from '@/features/productflows/api/use-get-productflow';
import { ProductflowForm } from '@/features/productflows/components/productflow-form';
import { useOpenProductflow } from '@/features/productflows/hooks/use-open-productflow';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual vehicleType schema from your schema file

// Use the actual vehicleType schema, omitting the id field for editing
// const formSchema = vehicleTypeSchema.omit({ id: true });
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

export const EditProductflowSheet = () => {
  const { isOpen, onClose, id } = useOpenProductflow();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this vehicleType.'
  );

  const productflowQuery = useGetProductflow(id);
  const editMutation = useEditProductflow(id);
  const deleteMutation = useDeleteProductflow(id);

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
  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    vehicleTypeQuery.isLoading;

  const isLoading = vehicleTypeQuery.isLoading || vehicleTypeQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    // console.log('Submitting values:', values); // Add this line
    editMutation.mutate({
      ...values,
      timePeriodId: values.timePeriodId.toString(),
      sourceId: values.sourceId.toString(),
      destinationId: values.destinationId.toString(),
      vehicleTypeId: values.vehicleTypeId.toString(),
      productId: values.productId.toString(),
      minThroughput: values.minThroughput?.toString(),
      maxThroughput: values.maxThroughput?.toString()
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

  const defaultValues = productflowQuery.data
    ? {
        label: productflowQuery.data.label || '',
        sourceId: productflowQuery.data.sourceId || 0,
        destinationId: productflowQuery.data.destinationId || 0,
        minThroughput: productflowQuery.data.minThroughput ? Number(productflowQuery.data.minThroughput) : undefined,
        maxThroughput: productflowQuery.data.maxThroughput ? Number(productflowQuery.data.maxThroughput) : undefined,
        vehicleTypeId: productflowQuery.data.vehicleTypeId || 0,
        productId: productflowQuery.data.productId || 0,
        timePeriodId: productflowQuery.data.timePeriodId || 0,
        fixed: productflowQuery.data.fixed || false,
        inclusionType: productflowQuery.data.inclusionType || ''
      }
    : {
        label: '',
        sourceId: 0,
        destinationId: 0,
        minThroughput: undefined,
        maxThroughput: undefined,
        vehicleTypeId: 0,
        productId: 0,
        timePeriodId: 0,
        fixed: false,
        inclusionType: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit vehicleType</SheetTitle>
            <SheetDescription>Edit an existing vehicleType</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <ProductflowForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilityOptions={facilityOptions}
              periodOptions={periodOptions}
              vehicleTypeOptions={vehicleTypeOptions}
              productOptions={productOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
