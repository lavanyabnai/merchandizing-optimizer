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

const formSchema = z.object({
  productId: z.number().optional(),
  amountFrom:z.number(),
  unitFrom: z.string(),
  amountTo: z.number(),
  unitTo: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  productOptions: { label: string; value: number }[];
};

export const UnitconversionForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  productOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {

    }
  });

  const handleSubmit = (values: FormValues) => {
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
                  placeholder="Select a product"
                /> 
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> 
        <FormField
          name="amountFrom"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount From</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Amount From"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="unitFrom"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit From</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Unit From"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="amountTo"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount To</FormLabel>
              <FormControl>
                <Input
                 {...field}
                 disabled={disabled}
                  placeholder="Amount To"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="unitTo"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit To</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Unit To"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create unitconversion'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete unitconversion
          </Button>
        )}
      </form>
    </Form>
  );
};
