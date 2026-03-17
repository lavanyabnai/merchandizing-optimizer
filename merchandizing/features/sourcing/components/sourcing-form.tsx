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

// Define the form schema based on the sourcing table structure
const formSchema = z.object({
  deliveryDestination: z.string(),

  productId: z.number().int().positive(),
  type: z.string(),

  timePeriodId: z.number().int().positive(),
  inclusionType: z.string(),

});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;

  productOptions: { label: string; value: number }[];
  timePeriodOptions: { label: string; value: number }[];
};

export const SourcingForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,

  productOptions,
  timePeriodOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      type: 'Periodic sourcing'
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
              <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Type"
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
                  value={JSON.stringify(field.value)}
                  disabled={disabled}
                  placeholder="Parameters"
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

<FormField
          name="deliveryDestination"
          control={form.control}
          render={({ field }) => (
            <FormItem>
                <FormLabel>Delivery Destination</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Delivery Destination"
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
          name="sources"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sources</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

    

        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create sourcing'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete sourcing
          </Button>
        )}
      </form>
    </Form>
  );
};
