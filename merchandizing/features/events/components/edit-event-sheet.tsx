import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useEditEvent } from '@/features/events/api/use-edit-event';
import { useGetEvent } from '@/features/events/api/use-get-event';
import { EventForm } from '@/features/events/components/event-form';
import { useOpenEvent } from '@/features/events/hooks/use-open-event';
import { useConfirm } from '@/hooks/use-confirm';
import { useDeleteEvent } from '../api/use-delete-event';
// Import the actual event schema from your schema file


const eventSchema = z.object({
  name: z.string(),
  eventType: z.string(),
  parameters: z.number().optional(),
  occurrenceType: z.string().optional(),
  occurrenceTime: z.string().optional(),
  triggerEventName: z.string().optional(),
  probability:  z.number(),

});
type FormValues = z.infer<typeof eventSchema>;

export const EditEventSheet = () => {
  const { isOpen, onClose, id } = useOpenEvent();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this event.'
  );

  const eventQuery = useGetEvent(id);
  const editMutation = useEditEvent(id);
  const deleteMutation = useDeleteEvent(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    eventQuery.isLoading;

  const isLoading =
    eventQuery.isLoading ||
    !eventQuery.data;

  const onSubmit = (values: FormValues) => {
    console.log('edit event form', values);
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

  const defaultValues = eventQuery.data
    ? {
      name: eventQuery.data.name,
      eventType: eventQuery.data.eventType,
      parameters: eventQuery.data.parameters ?? undefined,
      occurrenceType: eventQuery.data.occurrenceType,
      occurrenceTime: eventQuery.data.occurrenceTime,
      triggerEventName: eventQuery.data.triggerEventName,
      probability: eventQuery.data.probability,
    }
    : {
        name: '',
        eventType: '',
        parameters: undefined,
        occurrenceType: '',
        occurrenceTime: '',
        triggerEventName: '',
        probability: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Event</SheetTitle>
            <SheetDescription>Edit an Existing Event</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <EventForm
              id={Number(id)}
              defaultValues={{
                ...defaultValues,
                probability: Number(defaultValues.probability),
                parameters: defaultValues.parameters === null ? undefined : defaultValues.parameters,
                triggerEventName: defaultValues.triggerEventName || undefined
              }}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}

            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}