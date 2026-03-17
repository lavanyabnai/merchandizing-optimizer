import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteCo2facilitie } from '@/features/co2facilities/api/use-delete-co2facilitie';
import { useEditCo2facilitie } from '@/features/co2facilities/api/use-edit-co2facilitie';
import { useGetCo2facilitie } from '@/features/co2facilities/api/use-get-co2facilitie';
import { Co2facilitieForm } from '@/features/co2facilities/components/co2facilitie-form';
import { useOpenCo2facilitie } from '@/features/co2facilities/hooks/use-open-co2facilitie';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useConfirm } from '@/hooks/use-confirm';


const co2facilitieSchema = z.object({
  facilityId: z.number(),
  co2EmissionSource: z.string(),
  co2Produced: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  timeUnit: z.string(),
  productUnit: z.string().optional(),
  timePeriodId: z.number().optional()
});

type FormValues = z.infer<typeof co2facilitieSchema>;

export const EditCo2facilitieSheet = () => {
  const { isOpen, onClose, id } = useOpenCo2facilitie();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this co2facilitie.'
  );

  const co2facilitieQuery = useGetCo2facilitie(id);
  const editMutation = useEditCo2facilitie(id);
  const deleteMutation = useDeleteCo2facilitie(id);

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
    co2facilitieQuery.isLoading;

  const isLoading = co2facilitieQuery.isLoading || periodQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    if (values.co2Produced === undefined) {
      values.co2Produced = 0;
      values.timePeriodId = values.timePeriodId || 0;
      values.productUnit = values.productUnit || '';
    }
    editMutation.mutate(values as Required<FormValues>, {
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

  const defaultValues = co2facilitieQuery.data
    ? {
        facilityId: co2facilitieQuery.data.facilityId,
        co2EmissionSource: co2facilitieQuery.data.co2EmissionSource,
        co2Produced: co2facilitieQuery.data.co2Produced ,
        timeUnit: co2facilitieQuery.data.timeUnit ,
        productUnit: co2facilitieQuery.data.productUnit,
        timePeriodId: co2facilitieQuery.data.timePeriodId
      }
    : {
        facilityId: 0,
        co2EmissionSource: '',
        co2Produced: 0,
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
            <SheetTitle>Edit Co2facilitie</SheetTitle>
            <SheetDescription>Edit an existing co2facilitie</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <Co2facilitieForm
              id={Number(id) || undefined}
              defaultValues={{
                facilityId: defaultValues.facilityId,
                co2EmissionSource: defaultValues.co2EmissionSource,
                co2Produced: defaultValues.co2Produced ? Number(defaultValues.co2Produced) : undefined,
                timeUnit: defaultValues.timeUnit || undefined,
                productUnit: defaultValues.productUnit || undefined,
                timePeriodId: defaultValues.timePeriodId
              }}
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
