import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteTariff } from '@/features/tariffs/api/use-delete-tariff';
import { useEditTariff } from '@/features/tariffs/api/use-edit-tariff';
import { useGetTariff } from '@/features/tariffs/api/use-get-tariff';
import { TariffForm } from '@/features/tariffs/components/tariff-form';
import { useOpenTariff } from '@/features/tariffs/hooks/use-open-tariff';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual tariff schema from your schema file


const tariffSchema = z.object({
  fromId: z.number().int().positive(),
  toId: z.number().int().positive(),
  productId: z.number().int().positive(),
  fixed:z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
  adValorem:z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
  timePeriodId: z.number().int().positive(),
  currency:z.string().optional(),
  inclusionType:z.string().optional(),
  productUnit:z.string().optional(),
  tariffType:z.string().optional(),

});
type FormValues = z.infer<typeof tariffSchema>;

export const EditTariffSheet = () => {
  const { isOpen, onClose, id } = useOpenTariff();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this tariff.'
  );

  const tariffQuery = useGetTariff(id);
  const editMutation = useEditTariff(id);
  const deleteMutation = useDeleteTariff(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    tariffQuery.isLoading;

  const isLoading =
    tariffQuery.isLoading ||
    !tariffQuery.data;

 

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
    console.log('edit tariff form', values);
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

  const defaultValues = tariffQuery.data
    ? {
        fromId: tariffQuery.data.fromId,
        toId: tariffQuery.data.toId,
        productId: tariffQuery.data.productId,
        fixed: tariffQuery.data.fixed,
        adValorem: tariffQuery.data.adValorem,
        currency: tariffQuery.data.currency,
        inclusionType: tariffQuery.data.inclusionType,
        productUnit: tariffQuery.data.productUnit,
        tariffType: tariffQuery.data.tariffType,
        timePeriodId: tariffQuery.data.timePeriodId,
      }
    : {
        fromId: 0,
        toId: 0,
        productId: 0,
        fixed: '',
        adValorem: '',
        currency: '',
        inclusionType: '',
        productUnit: '',
        tariffType: '',
        timePeriodId: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Tariff</SheetTitle>
            <SheetDescription>Edit an existing tariff</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <TariffForm
              id={Number(id) }
              defaultValues={{
                ...defaultValues,
                fixed: defaultValues.fixed ? Number(defaultValues.fixed) : undefined,
                adValorem: defaultValues.adValorem ? Number(defaultValues.adValorem) : undefined
              }}
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
}