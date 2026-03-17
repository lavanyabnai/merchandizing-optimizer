import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteTimewindow } from '@/features/timewindow/api/use-delete-timewindow';
import { useEditTimewindow } from '@/features/timewindow/api/use-edit-timewindow';
import { useGetTimewindow } from '@/features/timewindow/api/use-get-timewindow';
import { TimewindowForm } from '@/features/timewindow/components/timewindow-form';
import { useOpenTimewindow } from '@/features/timewindow/hooks/use-open-timewindow';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useConfirm } from '@/hooks/use-confirm';

const timewindowSchema = z.object({
  facilityId: z.number().int().positive(),
  startTime: z.string(),
  endTime: z.string(),
  operation: z.string(),
  timePeriodId: z.number().int().positive(),
});
type FormValues = z.infer<typeof timewindowSchema>;

export const EditTimewindowSheet = () => {
  const { isOpen, onClose, id } = useOpenTimewindow();
  const facilitieQuery = useGetFacilities();
  const timePeriodQuery = useGetPeriods();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this timewindow.'
  );

  const timewindowQuery = useGetTimewindow(id);
  const editMutation = useEditTimewindow(id);
  const deleteMutation = useDeleteTimewindow(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    timewindowQuery.isLoading;

  const isLoading =
    timewindowQuery.isLoading ||
    !timewindowQuery.data;

 

    const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
      label: facilitie.name,
      value: facilitie.id
    }));
    const timePeriodOptions = (timePeriodQuery.data ?? []).map((timePeriod) => ({
      label: timePeriod.name,
      value: timePeriod.id
    }));
  const onSubmit = (values: FormValues) => {
    console.log('edit timewindow form', values);
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

  const defaultValues = timewindowQuery.data
    ? {
        facilityId: timewindowQuery.data.facilityId,
        daysOfWeek: timewindowQuery.data.daysOfWeek,
        startTime: timewindowQuery.data.startTime,
        endTime: timewindowQuery.data.endTime,
        operation: timewindowQuery.data.operation,
        timePeriodId: timewindowQuery.data.timePeriodId,
      }
    : {
        facilityId: 0,
        startTime: '',
        endTime: '',
        operation: '',
        timePeriodId: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Timewindow</SheetTitle>
            <SheetDescription>Edit an existing timewindow</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <TimewindowForm
              id={Number(id) || undefined}
              defaultValues={defaultValues ? {
                ...defaultValues,
                startTime: defaultValues.startTime || undefined,
                endTime: defaultValues.endTime || undefined
              } : undefined}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilitieOptions={facilitieOptions}
              timePeriodOptions={timePeriodOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}