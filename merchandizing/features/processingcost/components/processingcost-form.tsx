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

// Define the form schema based on the processingcost table structure
const formSchema = z.object({
  facilityId: z.number().int().positive(),
  productId: z.number().int().positive(),
  type: z.string(),
  units: z.string(),
  cost:z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
  currency: z.string().optional(),
  timePeriodId: z.number().int().positive(),

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
  timePeriodOptions: { label: string; value: number }[];
};

export const ProcessingcostForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  facilitieOptions,
  productOptions,
  timePeriodOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      type: 'Periodic processingcost'
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
                    { label: 'Periodic processingcost', value: 'Periodic processingcost' },
                    { label: 'Historic processingcost', value: 'Historic processingcost' }
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
          name="cost"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Cost"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          name="currency"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
              <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Currency"
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
                  options={timePeriodOptions.map((option) => ({
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
          name="currency"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

    

        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create processingcost'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete processingcost
          </Button>
        )}
      </form>
    </Form>
  );
};
