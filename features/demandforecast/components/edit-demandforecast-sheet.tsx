import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteDemandforecast } from '@/features/demandforecast/api/use-delete-demandforecast';
import { useEditDemandforecast } from '@/features/demandforecast/api/use-edit-demandforecast';
import { useGetDemandforecast } from '@/features/demandforecast/api/use-get-demandforecast';
import { DemandforecastForm } from '@/features/demandforecast/components/demandforecast-form';
import { useOpenDemandforecast } from '@/features/demandforecast/hooks/use-open-demandforecast';

import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual demandforecast schema from your schema file

const demandforecastSchema = z.object({
  facilityId: z.number().int().positive(),
  productId: z.number().int().positive(),
  type: z.string(),
  parameters: z.number(),
  timePeriodId: z.number().int().positive()
});
type FormValues = z.infer<typeof demandforecastSchema>;

export const EditDemandforecastSheet = () => {
  const { isOpen, onClose, id } = useOpenDemandforecast();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this demandforecast.'
  );

  const demandforecastQuery = useGetDemandforecast(id);
  const editMutation = useEditDemandforecast(id);
  const deleteMutation = useDeleteDemandforecast(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    demandforecastQuery.isLoading;

  const isLoading = demandforecastQuery.isLoading || !demandforecastQuery.data;

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
  const onSubmit = (values: FormValues) => {
    console.log('edit demandforecast form', values);
    editMutation.mutate({
      ...values,
      parameters: { value: values.parameters }
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

  const defaultValues = demandforecastQuery.data
    ? {
        facilityId: demandforecastQuery.data.facilityId,
        productId: demandforecastQuery.data.productId,
        type: demandforecastQuery.data.type,
        parameters: demandforecastQuery.data.parameters,
        timePeriodId: demandforecastQuery.data.timePeriodId
      }
    : {
        facilityId: 0,
        productId: 0,
        type: '',
        parameters: 0,
        timePeriodId: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Demandforecast</SheetTitle>
            <SheetDescription>Edit an existing demandforecast</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <DemandforecastForm
              id={Number(id) || undefined}
              defaultValues={defaultValues as Partial<FormValues>}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilitieOptions={facilitieOptions}
              productOptions={productOptions}
              timePeriodOptions={timePeriodOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
