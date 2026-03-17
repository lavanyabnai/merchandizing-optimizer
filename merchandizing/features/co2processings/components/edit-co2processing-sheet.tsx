import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteCo2processing } from '@/features/co2processings/api/use-delete-co2processing';
import { useEditCo2processing } from '@/features/co2processings/api/use-edit-co2processing';
import { useGetCo2processing } from '@/features/co2processings/api/use-get-co2processing';
import { Co2processingForm } from '@/features/co2processings/components/co2processing-form';
import { useOpenCo2processing } from '@/features/co2processings/hooks/use-open-co2processing';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useConfirm } from '@/hooks/use-confirm';


const co2processingSchema = z.object({
  facilityId: z.number(),
  productId: z.number(),
  processingType: z.string(),
  units: z.string(),
  co2Produced: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  timePeriodId: z.number(),
  co2CalculationFormula: z.string().optional()
});

type FormValues = z.infer<typeof co2processingSchema>;

export const EditCo2processingSheet = () => {
  const { isOpen, onClose, id } = useOpenCo2processing();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this co2processing.'
  );

  const co2processingQuery = useGetCo2processing(id);
  const editMutation = useEditCo2processing(id);
  const deleteMutation = useDeleteCo2processing(id);

  const facilityQuery = useGetFacilities();
  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));

  const periodQuery = useGetPeriods();
  const periodOptions = (periodQuery.data ?? []).map((period) => ({
    label: period.name,
    value: period.id
  }));
 const productQuery = useGetProducts();
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));
  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    co2processingQuery.isLoading;

  const isLoading = co2processingQuery.isLoading || periodQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const mutationValues = {
      ...values,
      co2Produced: values.co2Produced ?? 0
    };
    editMutation.mutate(mutationValues, {
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

  const defaultValues = co2processingQuery.data
    ? {
        facilityId: co2processingQuery.data.facilityId,
        productId: co2processingQuery.data.productId,
        processingType: co2processingQuery.data.processingType,
        units: co2processingQuery.data.units,
        co2Produced: co2processingQuery.data.co2Produced,
        timePeriodId: co2processingQuery.data.timePeriodId
      }
    : {
        facilityId: 0,
        productId: 0,
        processingType: '',
        units: '',
        co2Produced: 0,
        timePeriodId: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Co2processing</SheetTitle>
            <SheetDescription>Edit an existing co2processing</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <Co2processingForm
              id={Number(id) || undefined}
              defaultValues={defaultValues as any}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              periodOptions={periodOptions as any}
              facilityOptions={facilityOptions as any}
              productOptions={productOptions as any}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
