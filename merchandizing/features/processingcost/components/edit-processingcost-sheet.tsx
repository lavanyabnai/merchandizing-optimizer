import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteProcessingcost } from '@/features/processingcost/api/use-delete-processingcost';
import { useEditProcessingcost } from '@/features/processingcost/api/use-edit-processingcost';
import { useGetProcessingcost } from '@/features/processingcost/api/use-get-processingcost';
import { ProcessingcostForm } from '@/features/processingcost/components/processingcost-form';
import { useOpenProcessingcost } from '@/features/processingcost/hooks/use-open-processingcost';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual processingcost schema from your schema file


const processingcostSchema = z.object({
  facilityId: z.number().int().positive(),  
  productId: z.number().int().positive(),
  type: z.string(),
  units: z.string(),
  cost:z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
  currency: z.string(),
  timePeriodId: z.number().int().positive(),
});
type FormValues = z.infer<typeof processingcostSchema>;

export const EditProcessingcostSheet = () => {
  const { isOpen, onClose, id } = useOpenProcessingcost();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this processingcost.'
  );

  const processingcostQuery = useGetProcessingcost(id);
  const editMutation = useEditProcessingcost(id);
  const deleteMutation = useDeleteProcessingcost(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    processingcostQuery.isLoading;

  const isLoading =
    processingcostQuery.isLoading ||
    !processingcostQuery.data;

 

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
    console.log('edit processingcost form', values);
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

  const defaultValues = processingcostQuery.data
    ? {
        facilityId: processingcostQuery.data.facilityId,
        productId: processingcostQuery.data.productId ?? 0,
        type: processingcostQuery.data.type,
        units: processingcostQuery.data.units,
        cost: processingcostQuery.data.cost,
        currency: processingcostQuery.data.currency,
        timePeriodId: processingcostQuery.data.timePeriodId ?? 0,
      }
    : {
        facilityId: 0,
        productId: 0,
        type: '',
        units: '',
        cost: '',
        currency: '',
        timePeriodId: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Processingcost</SheetTitle>
            <SheetDescription>Edit an existing processingcost</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <ProcessingcostForm
              id={Number(id) || undefined}
              defaultValues={{
                ...defaultValues,
                cost: defaultValues.cost === '' ? undefined : Number(defaultValues.cost),
                currency: defaultValues.currency ?? '',
              }}
              onSubmit={onSubmit as (values: {
                facilityId: number;
                productId: number;
                type: string;
                units: string;
                timePeriodId: number;
                cost?: number;
                currency?: string;
              }) => void}
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