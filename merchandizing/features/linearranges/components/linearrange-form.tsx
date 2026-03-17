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
  name: z.string().min(1),
  lowerBound: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  expression: z.string(),
  upperBound: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const LinearrangeForm = ({
  defaultValues,
  onSubmit,
  onDelete,
  disabled
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
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
                  placeholder="Linearrange name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="lowerBound"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lower Bound</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Lower Bound"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="expression"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expression</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Expression"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="upperBound"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upper Bound</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Upper Bound"
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
