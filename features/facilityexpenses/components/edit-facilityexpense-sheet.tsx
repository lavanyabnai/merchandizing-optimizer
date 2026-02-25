import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteFacilityexpense } from '@/features/facilityexpenses/api/use-delete-facilityexpense';
import { useEditFacilityexpense } from '@/features/facilityexpenses/api/use-edit-facilityexpense';
import { useGetFacilityexpense } from '@/features/facilityexpenses/api/use-get-facilityexpense';
import { FacilityexpenseForm } from '@/features/facilityexpenses/components/facilityexpense-form';
import { useOpenFacilityexpense } from '@/features/facilityexpenses/hooks/use-open-facilityexpense';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useConfirm } from '@/hooks/use-confirm';


const facilityexpenseSchema = z.object({
  facilityId: z.number(),
  expenseType: z.string(),
  value: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  currency: z.string(),
  timeUnit: z.string().optional(),
  productUnit: z.string().optional(),
  timePeriodId: z.number().optional()
});

type FormValues = z.infer<typeof facilityexpenseSchema>;

export const EditFacilityexpenseSheet = () => {
  const { isOpen, onClose, id } = useOpenFacilityexpense();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this facilityexpense.'
  );

  const facilityexpenseQuery = useGetFacilityexpense(id);
  const editMutation = useEditFacilityexpense(id);
  const deleteMutation = useDeleteFacilityexpense(id);

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

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    facilityexpenseQuery.isLoading;

  const isLoading = facilityexpenseQuery.isLoading || periodQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    
    editMutation.mutate({
      ...values,
      value: values.value ?? 0,
      timeUnit: values.timeUnit ?? '',
      productUnit: values.productUnit ?? '',
      timePeriodId: values.timePeriodId ?? 0
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

  const defaultValues = facilityexpenseQuery.data
    ? {
        facilityId: facilityexpenseQuery.data.facilityId,
        expenseType: facilityexpenseQuery.data.expenseType,
        value: facilityexpenseQuery.data.value ?? undefined,
        currency: facilityexpenseQuery.data.currency,
        timeUnit: facilityexpenseQuery.data.timeUnit ?? undefined,
        productUnit: facilityexpenseQuery.data.productUnit ?? undefined,
        timePeriodId: facilityexpenseQuery.data.timePeriodId ?? undefined
      }
    : {
        facilityId: 0,
        expenseType: '',
        value: 0,
        currency: '',
        timeUnit: '',
        productUnit: '',
        timePeriodId: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Facilityexpense</SheetTitle>
            <SheetDescription>Edit an existing facilityexpense</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <FacilityexpenseForm
              id={Number(id) || undefined}
              defaultValues={defaultValues as Partial<FormValues>}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              periodOptions={periodOptions}
              facilityOptions={facilityOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
