import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useCreateTimewindow } from '@/features/timewindow/api/use-create-timewindow';
import { TimewindowForm } from '@/features/timewindow/components/timewindow-form';
import { useNewTimewindow } from '@/features/timewindow/hooks/use-new-timewindow';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';

// Assuming you have a schema for timewindow, replace this with the actual schema

const timewindowSchema = z.object({
  facilityId: z.number().int().positive(),

  startTime: z.string(),
  endTime: z.string(),
  operation: z.string(),
  timePeriodId: z.number().int().positive(),

});

type FormValues = z.infer<typeof timewindowSchema>;

export const NewTimewindowSheet = () => {
  const { isOpen, onClose } = useNewTimewindow();
  const createMutation = useCreateTimewindow();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const facilitieQuery = useGetFacilities();
  const timePeriodQuery = useGetPeriods();
  // Replace with actual mutation
  const facilitieMutation = { isPending: false }; // Replace with actual mutation
  const timePeriodMutation = { isPending: false }; // Replace with actual mutation

  const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
    label: facilitie.name,
    value: facilitie.id
  }));
  const timePeriodOptions = (timePeriodQuery.data ?? []).map((timePeriod) => ({
    label: timePeriod.name,
    value: timePeriod.id
  }));

  const isPending =
    createMutation.isPending ||
    facilitieMutation.isPending ||
    timePeriodMutation.isPending;
  const isLoading =
    facilitieQuery.isLoading ||
    timePeriodQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    console.log(`Form values: ${JSON.stringify(values)}`);
    createMutation.mutate({
      ...values,
      startTime: new Date(values.startTime),
      endTime: new Date(values.endTime),
      daysOfWeek: 0,
      facilityName: '',
      timePeriodName: ''
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Time Window</SheetTitle>
          <SheetDescription>Add a New Time Window</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <TimewindowForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilitieOptions={facilitieOptions}
            timePeriodOptions={timePeriodOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
