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


// Define the form schema based on the productstorage table structure
const formSchema = z.object({
  label: z.string().optional(),
  facilityId: z.number().int().positive(), 
  facilityName: z.string().optional(),
  productId: z.number().int().positive(),
  productName: z.string().optional(),
  expandProducts: z.boolean(),
  currency: z.string(),
  timePeriodId: z.number().int().positive(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']),
  minStock: z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
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

export const ProductstorageForm = ({
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
      inclusionType: 'Include'
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
          name="label"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Select a Label"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="expandProducts"
          control={form.control}
          render={({ field }) => (
            <FormItem>
                <FormLabel>Expand Products</FormLabel>
              <FormControl>
              <Select
  options={[
    { label: "True", value: "true" },
    { label: "False", value: "false" }
  ]}
  value={field.value ? "true" : "false"} // Convert boolean to string
  onChange={(value) => field.onChange(value === "true")} // Convert selected value to boolean
  disabled={disabled}
  placeholder="Select True or False"
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
        name="minStock"
        control={form.control}
        render={({ field }) => (
          <FormItem>
              <FormLabel>Min Stock</FormLabel>
            <FormControl>
            <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Min Stock"
                />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    

        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create productstorage'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete productstorage
          </Button>
        )}
      </form>
    </Form>
  );
};
