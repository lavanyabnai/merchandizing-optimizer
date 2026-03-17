import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateCo2facilitie } from '@/features/co2facilities/api/use-create-co2facilitie';
import { Co2facilitieForm } from '@/features/co2facilities/components/co2facilitie-form';
import { useNewCo2facilitie } from '@/features/co2facilities/hooks/use-new-co2facilitie';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';


// Assuming you have a schema for co2facilitie, replace this with the actual schema
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

export const NewCo2facilitieSheet = () => {
  const { isOpen, onClose } = useNewCo2facilitie();
  const createMutation = useCreateCo2facilitie();

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
    const { co2Produced, ...rest } = values;
    const transformedValues = {
      ...rest,
      co2Produced: co2Produced?.toString() ?? '',
      timePeriodId: values.timePeriodId ?? 0,
      facilityName: facilityOptions.find((f) => f.value === values.facilityId)?.label || '',
      timePeriodName: periodOptions.find((p) => p.value === values.timePeriodId)?.label || ''
    };
    createMutation.mutate(transformedValues, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Co2facilitie</SheetTitle>
          <SheetDescription>Add a new co2facilitie</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <Co2facilitieForm
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
