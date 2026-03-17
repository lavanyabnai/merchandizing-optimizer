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

const formSchema = z.object({
  label: z.string().min(1),
  sourceId: z.number(),
  destinationId: z.number(),
  vehicleTypeId: z.number(),
  productId: z.number(),
  timePeriodId: z.number(),
  fixed: z.boolean(),
  minThroughput: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  maxThroughput: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  inclusionType: z.string()
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  facilityOptions: { label: string; value: number }[];
  vehicleTypeOptions: { label: string; value: number }[];
  productOptions: { label: string; value: number }[];
  periodOptions: { label: string; value: number }[];
};

export const ProductflowForm = ({
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  facilityOptions,
  vehicleTypeOptions,
  productOptions,
  periodOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues 
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
          name="label"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Productflow label"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="minThroughput"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Throughput</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Min Throughput"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="maxThroughput"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Throughput</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Max Throughput"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="sourceId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Select
                  options={facilityOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a facility"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="destinationId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Select
                  options={facilityOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a Destination"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="vehicleTypeId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Type</FormLabel>
              <FormControl>
                <Select
                  options={vehicleTypeOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a vehicle type"
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
          name="timePeriodId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Period</FormLabel>
              <FormControl>
                <Select
                  options={periodOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a time period"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="fixed"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fixed</FormLabel>
              <FormControl>
                <Select
                  options={[
                    { label: 'True', value: 'true' },
                    { label: 'False', value: 'false' }
                  ]}
                  value={field.value ? 'true' : 'false'} // Convert boolean to string
                  onChange={(value) => field.onChange(value === 'true')} // Convert selected value to boolean
                  disabled={disabled}
                  placeholder="Select True or False"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="inclusionType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inclusion Type</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Inclusion Type"
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
          <Button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            variant="outline"
            className="w-full"
          >
            Delete
          </Button>
        )}
      </form>
    </Form>
  );
};
