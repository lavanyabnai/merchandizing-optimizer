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

// Define the Zod schema for the form
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  start: z.string().min(1, 'Start date is required'),
  end: z.string().min(1, 'End date is required'),
  demandCoefficient: z.string().min(1, 'Demand Coefficient is required')
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const PeriodForm = ({
  defaultValues,
  onSubmit,
  onDelete,
  disabled
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || { name: '', start: '', end: '', demandCoefficient: '' }
  });

  const handleSubmit = (values: FormValues) => {
    console.log('values', values);
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
                  placeholder="Period name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="start"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  disabled={disabled}
                  placeholder="Start Date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="end"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  disabled={disabled}
                  placeholder="End Date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="demandCoefficient"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Demand Coefficient</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled={disabled}
                  placeholder="Demand Coefficient"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={disabled} className="w-full">
          Submit
        </Button>
        {onDelete && (
          <Button type="button" onClick={onDelete} disabled={disabled} variant="outline" className="w-full">
            Delete
          </Button>
        )}
      </form>
    </Form>
  );
};
