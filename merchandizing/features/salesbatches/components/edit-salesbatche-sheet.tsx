import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteSalesbatche } from '@/features/salesbatches/api/use-delete-salesbatche';
import { useEditSalesbatche } from '@/features/salesbatches/api/use-edit-salesbatche';
import { useGetSalesbatche } from '@/features/salesbatches/api/use-get-salesbatche';
import { SalesbatcheForm } from '@/features/salesbatches/components/salesbatche-form';
import { useOpenSalesbatche } from '@/features/salesbatches/hooks/use-open-salesbatches';

import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useConfirm } from '@/hooks/use-confirm';

const salesbatcheSchema = z.object({
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

type FormValues = z.infer<typeof salesbatcheSchema>;

export const EditSalesbatcheSheet = () => {
  const { isOpen, onClose, id } = useOpenSalesbatche();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this salesbatche.'
  );

  const facilityQuery = useGetFacilities();

  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));

  const productQuery = useGetProducts();

  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));

  const timePeriodQuery = useGetPeriods();

  const timePeriodOptions = (timePeriodQuery.data ?? []).map((timePeriod) => ({
    label: timePeriod.name,
    value: timePeriod.id
  }));

  const salesbatcheQuery = useGetSalesbatche(id);
  const editMutation = useEditSalesbatche(id);
  const deleteMutation = useDeleteSalesbatche(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    salesbatcheQuery.isLoading;

  const isLoading = salesbatcheQuery.isLoading;

  const onSubmit = (values: FormValues) => {

    editMutation.mutate({
      ...values,
      batchSize: values.batchSize || 0,
      pricePerUnit: values.pricePerUnit || 0,
      timePeriodId: values.timePeriodId || 0,
      stepSize: values.stepSize || 0
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

  const defaultValues = salesbatcheQuery.data
    ? {
        sourceId: salesbatcheQuery.data.sourceId,
        productId: salesbatcheQuery.data.productId,
        type: salesbatcheQuery.data.type,
        batchSize: salesbatcheQuery.data.batchSize,
        pricePerUnit: salesbatcheQuery.data.pricePerUnit,
        currency: salesbatcheQuery.data.currency,
        timePeriodId: salesbatcheQuery.data.timePeriodId ?? undefined,
        stepSize: salesbatcheQuery.data.stepSize
      }
    : {
        sourceId: 0,
        productId: 0,
        type: '',
        batchSize: '',
        pricePerUnit: '',
        currency: '',
        timePeriodId: undefined,
        stepSize: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Salesbatche</SheetTitle>
            <SheetDescription>
              Edit an existing salesbatche
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <SalesbatcheForm
              id={Number(id) || undefined}
              defaultValues={{
                ...defaultValues,
                batchSize: defaultValues.batchSize === '' ? undefined : Number(defaultValues.batchSize),
                pricePerUnit: defaultValues.pricePerUnit === '' ? undefined : Number(defaultValues.pricePerUnit),
                stepSize: defaultValues.stepSize === '' ? undefined : Number(defaultValues.stepSize),
              }}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilityOptions={facilityOptions}
              productOptions={productOptions}
              timePeriodOptions={timePeriodOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
