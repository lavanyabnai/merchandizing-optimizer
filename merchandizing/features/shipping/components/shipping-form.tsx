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

// Define the form schema based on the shipping table structure
const formSchema = z.object({
  sourceId: z.number().int().positive(),  
  destinationId: z.number().int().positive(),
  productId: z.number().int().positive(),
  vehicleTypeId: z.number().int().positive(),
  type: z.string(),
  priority: z.string(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']),
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
  vehicleTypeOptions: { label: string; value: number }[];
};

export const ShippingForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  facilitieOptions,
  productOptions,
  vehicleTypeOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      type: 'Periodic shipping'
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
          name="sourceId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Select
                    options={facilitieOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a Source"
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
                    options={facilitieOptions.map((option) => ({
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
                  placeholder="Select a Vehicle Type"
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
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Select Type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          name="parameters"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parameters</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ? JSON.stringify(field.value) : ''}
                  onChange={e => field.onChange(e.target.value ? JSON.parse(e.target.value) : undefined)}
                  disabled={disabled}
                  placeholder="Parameters"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

<FormField
          name="priority"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Priority"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

{/* <FormField
          name="daysOfWeek"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Days of Week</FormLabel>
              <FormControl>
              <Input
                  {...field}
                  value={field.value ? JSON.stringify(field.value) : ''}
                  onChange={e => field.onChange(e.target.value ? JSON.parse(e.target.value) : undefined)}
                  disabled={disabled}
                  placeholder="Days of Week"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

<FormField
          name="timePeriodId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Period</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ? JSON.stringify(field.value) : ''}
                  onChange={e => field.onChange(e.target.value ? JSON.parse(e.target.value) : undefined)}
                  disabled={disabled}
                  placeholder="Time Period"
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

    

        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create shipping'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete shipping
          </Button>
        )}
      </form>
    </Form>
  );
};
