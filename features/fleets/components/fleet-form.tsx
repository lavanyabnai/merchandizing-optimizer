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


// Define the form schema based on the fleet table structure
const formSchema = z.object({
  facilityId: z.number().int().positive(),  
  vehicleTypeId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  cost: z
  .string()
  .optional()
  .transform((val) => (val ? parseFloat(val) : undefined)),
  currency: z.string().optional(),
  timeUnit: z.string().optional()

});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  facilitieOptions: { label: string; value: number }[];
  vehicleTypeOptions: { label: string; value: number }[];
};

export const FleetForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  facilitieOptions,
  vehicleTypeOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      quantity: 0,
      cost: 0,
      currency: '',
      timeUnit: ''
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
                  value={String(field.value) }
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a Vehicle Type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />  <FormField
        name="quantity"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Select
                options={vehicleTypeOptions.map((option) => ({
                  ...option,
                  value: String(option.value)
                }))}
                value={String(field.value) }
                onChange={(value) => field.onChange(Number(value))}
                disabled={disabled}
                placeholder="Select a Quantity"
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
        />  <FormField
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
          {id ? 'Save changes' : 'Create fleet'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete fleet
          </Button>
        )}
      </form>
    </Form>
  );
};
