import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Select } from '@/components/select';
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

// Define the form schema based on the processingtime table structure
const formSchema = z.object({
  facilityId: z.number().int().positive(),
  productId: z.number().int().positive(),
  type: z.string(),
  units: z.string(),
  time:z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
  timeUnit: z.string(),

});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  facilitieOptions: { label: string; value: number }[];
  productOptions: { label: string; value: number }[];
};

export const ProcessingtimeForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  facilitieOptions,
  productOptions,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      type: 'Periodic processingtime'
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
          name="facilityId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facility</FormLabel>
              <FormControl>
                <Select
                  options={facilitieOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a Facility"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="productId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <FormControl>
                <Select
                  options={productOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a Product"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select
                  options={[
                    { label: 'Periodic processingtime', value: 'Periodic processingtime' },
                    { label: 'Historic processingtime', value: 'Historic processingtime' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select Type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="units"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Units</FormLabel>
              <FormControl>
              <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Units"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          name="time"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Time"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="timeUnit"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Unit</FormLabel>
              <FormControl>
              <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Time Unit"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create processingtime'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete processingtime
          </Button>
        )}
      </form>
    </Form>
  );
};
