import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateEvent } from '@/features/events/api/use-create-event';
import { EventForm } from '@/features/events/components/event-form';
import { useNewEvent } from '@/features/events/hooks/use-new-event';

// Assuming you have a schema for event, replace this with the actual schema

const eventSchema = z.object({
  name: z.string(),
  eventType: z.string().min(1),
  parameters: z.number().optional(),
  occurrenceType: z.string(),
  occurrenceTime: z.string(),
  triggerEventName: z.string().optional(),
  probability:  z.number(),
});

type FormValues = z.infer<typeof eventSchema>;

export const NewEventSheet = () => {
  const { isOpen, onClose } = useNewEvent();
  const createMutation = useCreateEvent();


 
 
  const onSubmit = (values: FormValues) => {
    const formattedValues = {
      ...values,
      probability: values.probability ? values.probability.toString() : '',
      occurrenceType: values.occurrenceType || '',
      occurrenceTime: values.occurrenceTime || '',
    };
    createMutation.mutate(formattedValues, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Event</SheetTitle>
          <SheetDescription>Add a New Event</SheetDescription>
        </SheetHeader>
        <EventForm 
          onSubmit={onSubmit} 
          defaultValues={{
            name: '',
            eventType: '',
            parameters: undefined,
            occurrenceType: '',
            occurrenceTime: '',
            triggerEventName: undefined,
            probability: 0
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
