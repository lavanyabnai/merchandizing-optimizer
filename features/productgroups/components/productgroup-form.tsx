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

//  id: serial('id').primaryKey(),
//     name: varchar('name', { length: 255 }).notNull(),
//     unit: varchar('unit', { length: 50 }).notNull(),
//     sellingPrice: numeric('selling_price').notNull(),
//     cost: numeric('cost').notNull(),
//     currency: varchar('currency', { length: 3 }).notNull(),
//     createdAt: timestamp('created_at').defaultNow(),
//     updatedAt: timestamp('updated_at').defaultNow()
const formSchema = z.object({
  name: z.string().min(1, 'Name is required')
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const ProductgroupForm = ({
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
                  placeholder="Productgroup name"
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
          <Button type="button" onClick={onDelete} disabled={disabled} variant="outline" className="w-full">
            Delete
          </Button>
        )}
      </form>
    </Form>
  );
};
