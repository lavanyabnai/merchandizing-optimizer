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
  facilityId: z.number().int().optional(),
  productId: z.number().int().optional(),
  policyType: z.string().optional(),
  initialStock: z.number().optional(),
  periodicCheck: z.boolean().optional(),
  period: z.number().optional(),
  firstPeriodicCheck: z.string().optional(),
  policyBasis: z.string().optional(),
  stockCalculationWindow: z.number().optional(),
  timeUnit: z.string().optional(),
  minSplitRatio: z.number().optional(),
  timePeriodId: z.number().int().optional(),
  inclusionType: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  facilityOptions: { label: string; value: number }[];
  productOptions: { label: string; value: number }[];
  periodOptions: { label: string; value: number }[];
};

export const InventoryForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  facilityOptions,
  productOptions,
  periodOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      inclusionType: 'Include'
    }
  });

  const handleSubmit = (values: FormValues) => {
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
              <FormLabel>Group</FormLabel>
              <FormControl>
                <Select
                  options={facilityOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a group"
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
          name="periodicCheck"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Periodic Check</FormLabel>
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
          name="policyType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Type</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Policy Type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="initialStock"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Stock</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Initial Stock"
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
                <Input {...field} disabled={disabled} placeholder="Time Unit" />
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
                <Select
                  options={[
                    { label: 'Include', value: 'Include' },
                    { label: 'Exclude', value: 'Exclude' },
                    { label: 'Consider', value: 'Consider' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select inclusion type"
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
                  placeholder="Select a product"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create inventory'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete inventory
          </Button>
        )}
      </form>
    </Form>
  );
};
