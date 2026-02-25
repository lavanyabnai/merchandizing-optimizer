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

// Define the form schema based on the path table structure
const formSchema = z.object({
  name: z.string(),
  fromLocation: z.string(),
  toLocation: z.string(),
  costCalculationPolicy: z.string(),
  // costPuPk:z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // timeUnit: z.string().optional(),
  // straight: z.boolean(),
  // currency: z.string().optional(),
  // distance:z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // distanceUnit: z.string().optional(),
  // transportationTime:z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  vehicleTypeId: z.number().int().positive(),
  // transportationPolicy: z.string(),
  // minLoadRatio: z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // timePeriod: z.string(),
  // inclusionType: z.string(),

});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  vehicleTypeOptions: { label: string; value: number }[];

};

export const PathForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  vehicleTypeOptions, 
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
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
            <Input {...field} disabled={disabled} 
            placeholder="Name"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
     <FormField
      name="fromLocation"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>From Location</FormLabel>
          <FormControl>
            <Input {...field} disabled={disabled} 
            placeholder="From Location"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
     <FormField
      name="toLocation"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>To Location</FormLabel>
          <FormControl>
            <Input {...field} disabled={disabled} 
            placeholder="To Location"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
     <FormField
      name="costCalculationPolicy"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cost Calculation Policy</FormLabel>
          <FormControl>
            <Input {...field} disabled={disabled}
            placeholder="Cost Calculation Policy"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    /> <FormField
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
  />
        {/* <FormField
          name="transportationPolicy"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transportation Policy</FormLabel>
              <FormControl>
                <Input {...field}
                 disabled={disabled} 
                 placeholder="Transportation Policy"
                 />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="straight"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Straight</FormLabel>
              <FormControl>
                <Select
                  options={[
                    { label: 'True', value: 'true' },
                    { label: 'False', value: 'false' }
                  ]}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(value === 'true')}
                  disabled={disabled}
                  placeholder="Select Straight"
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
          name="distance"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Distance"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          name="distanceUnit"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance Unit</FormLabel>
              <FormControl>
              <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Distance Unit"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="transportationTime"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transportation Time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Transportation Time"
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
                <Input {...field} disabled={disabled}
                 placeholder="Currency"
                 />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
 <FormField
          name="minLoadRatio"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Load Ratio</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} 
                placeholder="Min Load Ratio"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> 
        <FormField
        name="timePeriod"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Time Period</FormLabel>
            <FormControl>
              <Input {...field} disabled={disabled} 
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
            <Input {...field} disabled={disabled} 
            placeholder="Inclusion Type"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="costPuPk"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cost PU PK</FormLabel>
          <FormControl>
            <Input {...field} disabled={disabled}
            placeholder="Cost PU PK"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
     */}

        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create path'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete Path
          </Button>
        )}
      </form>
    </Form>
  );
};
