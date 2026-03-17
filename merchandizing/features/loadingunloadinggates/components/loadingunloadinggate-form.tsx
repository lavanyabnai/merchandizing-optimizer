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

// Define the form schema based on the loadingunloadinggate table structure
const formSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  facilityId: z.number().int().positive(),
  type: z.string(),
  vehicleTypes: z.number(),
  numberOfGates: z.number().int().positive(),
  units: z.string(),
  processingTime: z
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
  vehicleTypeOptions: { label: string; value: number }[];
};

export const LoadingunloadinggateForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  facilitieOptions,
  vehicleTypeOptions,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      type: 'Periodic loadingunloadinggate'
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
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} />
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
         <FormField
  name="vehicleTypes"
  control={form.control}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Vehicle Types</FormLabel>
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
          name="processingTime"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Processing Time"
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

<FormField
          name="numberOfGates"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Gates</FormLabel>
              <FormControl>
                <Input
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
        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create loadingunloadinggate'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete loadingunloadinggate
          </Button>
        )}
      </form>
    </Form>
  );
};
