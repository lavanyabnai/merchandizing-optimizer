import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  unit: z.string().min(1, 'Unit is required'),
  sellingPrice: z
    .string()
    .transform((val) => (val ? parseInt(val) : undefined)),
  cost: z.string().transform((val) => (val ? parseInt(val) : undefined)),
  currency: z.string().min(1, 'Currency is required')
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const ProductForm = ({
  defaultValues,
  onSubmit,
  onDelete,
  disabled
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
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Product name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="unit"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} placeholder="Unit" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="sellingPrice"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selling Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled={disabled}
                  placeholder="Selling Price"
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
                  type="number"
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
                <Input {...field} disabled={disabled} placeholder="Currency" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={disabled} className="w-full">
          Submit
        </Button>
        {onDelete && (
          <Button type="button" onClick={onDelete} disabled={disabled} variant="outline" className="w-full">
            Delete
          </Button>
        )}
      </form>
    </Form>
  );
};
