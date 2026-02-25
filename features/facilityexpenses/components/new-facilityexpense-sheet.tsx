import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateFacilityexpense } from '@/features/facilityexpenses/api/use-create-facilityexpense';
import { FacilityexpenseForm } from '@/features/facilityexpenses/components/facilityexpense-form';
import { useNewFacilityexpense } from '@/features/facilityexpenses/hooks/use-new-facilityexpense';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';


// Assuming you have a schema for facilityexpense, replace this with the actual schema
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

export const NewFacilityexpenseSheet = () => {
  const { isOpen, onClose } = useNewFacilityexpense();
  const createMutation = useCreateFacilityexpense();

  // Placeholder for useLocation hook
  const facilityQuery = useGetFacilities();
  const periodQuery = useGetPeriods();
  const locationMutation = { isPending: false }; // Replace with actual mutation

  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));
  const periodOptions = (periodQuery.data ?? []).map((period) => ({
    label: period.name,
    value: period.id
  }));

  const isPending = createMutation.isPending || locationMutation.isPending;
  const isLoading = facilityQuery.isLoading || periodQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const formattedValues = {
      ...values,
      value: (values.value ?? 0).toString(),
      facilityName: facilityOptions.find(f => f.value === values.facilityId)?.label ?? '',
      timePeriodName: values.timePeriodId ? periodOptions.find(p => p.value === values.timePeriodId)?.label ?? '' : ''
    } as const;

    createMutation.mutate(formattedValues as any, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Facilityexpense</SheetTitle>
          <SheetDescription>Add a new facilityexpense</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <FacilityexpenseForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilityOptions={facilityOptions}
            periodOptions={periodOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
