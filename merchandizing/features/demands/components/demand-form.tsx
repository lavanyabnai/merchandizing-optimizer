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
import { Textarea } from '@/components/ui/textarea';

// Define the form schema based on the demand table structure
const formSchema = z.object({
  customerId: z.number().int().positive(),
  productId: z.number().int().positive(),
  demandType: z.string(),
  parameters: z.record(z.any()),
  timePeriodId: z.number().int().positive(),
  // revenue: z.float().optional(),
  // downPenalty: z.number().optional(),
  // upPenalty: z.number().optional(),
  currency: z.string().optional(),
  // expectedLeadTime: z.number().optional(),
  // timeUnit: z.string().optional(),
  // minSplitRatio: z.number().optional(),
  // backorderPolicy: z.string().optional(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider'])
  // additionalParams: z.record(z.unknown()).optional(),
  // icon: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  customerOptions: { label: string; value: number }[];
  productOptions: { label: string; value: number }[];
  timePeriodOptions: { label: string; value: number }[];
};

export const DemandForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  customerOptions,
  productOptions,
  timePeriodOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      demandType: 'Periodic demand'
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
          name="customerId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <Select
                  options={customerOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a customer"
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
                  placeholder="Select a product"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="demandType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Demand Type</FormLabel>
              <FormControl>
                <Select
                  options={[
                    { label: 'Periodic demand', value: 'Periodic demand' },
                    { label: 'Historic demand', value: 'Historic demand' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select demand type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="parameters"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parameters</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={disabled}
                  placeholder="Enter parameters as JSON"
                  value={
                    field.value ? JSON.stringify(field.value, null, 2) : ''
                  }
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      field.onChange(parsed);
                    } catch {
                      field.onChange(e.target.value);
                    }
                  }}
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
        {/* <FormField
          name="inclusionType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inclusion Type</FormLabel>
              <FormControl>
                <Select
                  options={[
                    { label: 'Include', value: 'Include' },
                    { label: 'Exclude', value: 'Exclude' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

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

        {/* <FormField
          name="downPenalty"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Down Penalty</FormLabel>
              <FormControl>
                <Input {...field} type="number" disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="upPenalty"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Up Penalty</FormLabel>
              <FormControl>
                <Input {...field} type="number" disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="expectedLeadTime"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Lead Time</FormLabel>
              <FormControl>
                <Input {...field} type="number" disabled={disabled} />
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
                <Input {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="minSplitRatio"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Split Ratio</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="backorderPolicy"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backorder Policy</FormLabel>
              <FormControl>
                <Select
                  options={[
                    { label: 'Not Allowed', value: 'Not Allowed' },
                    { label: 'Allowed Total', value: 'Allowed Total' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <FormField
          name="inclusionType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inclusion Type</FormLabel>
              <FormControl>
                <Select
                  options={[
                    { label: 'Include', value: 'Include' },
                    { label: 'Exclude', value: 'Exclude' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create demand'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete demand
          </Button>
        )}
      </form>
    </Form>
  );
};
