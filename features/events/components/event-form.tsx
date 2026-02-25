import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';


import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Define the form schema based on the event table structure
const formSchema = z.object({
  name: z.string(),
  eventType: z.string(),
  parameters: z.number().optional(),
  occurrenceType: z.string(),
  occurrenceTime: z.string(),
  triggerEventName: z.string().optional(),
  probability:  z.number(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const EventForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {

    }
  });

  const handleSubmit = (values: FormValues) => {
    console.log(`Form values: ${JSON.stringify(values)}`);
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4 bg-white"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Select a Name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="eventType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <FormControl>
              <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Select a Event Type"
                />  
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="occurrenceType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occurrence Type</FormLabel>
              <FormControl>
              <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Select a Occurrence Type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            name="occurrenceTime"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel> Occurrence Time</FormLabel>
              <FormControl>
              <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Select a Occurrence Time"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          name="triggerEventName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trigger Event Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Select a Trigger Event Name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          name="probability"
          control={form.control}
          render={({ field }) => (
            <FormItem>
                <FormLabel>Probability</FormLabel>
              <FormControl>
              <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Select a Probability"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


           
    

        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create event'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete event
          </Button>
        )}
      </form>
    </Form>
  );
};
