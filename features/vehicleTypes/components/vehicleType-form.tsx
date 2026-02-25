import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Select } from "@/components/select";
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
  name: z.string().min(1, 'Name is required'),
  capacity: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
  capacityUnit: z.string().optional(),
  speed: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
  speedUnit: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  unitsOptions: { label: string; value: string }[];
};

export const VehicleTypeForm = ({
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  unitsOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {name:''}
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
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter vehicle type name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="capacity"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter capacity" type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="capacityUnit"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity Unit</FormLabel>
              <FormControl>
                <Select
                  options={unitsOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(String(value))}
                  disabled={disabled}
                  placeholder="Select a location"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="speed"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Speed</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter speed" type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="speedUnit"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Speed Unit</FormLabel>
              <FormControl>
                <Select
                  options={unitsOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(String(value))}
                  disabled={disabled}
                  placeholder="Select a location"
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
