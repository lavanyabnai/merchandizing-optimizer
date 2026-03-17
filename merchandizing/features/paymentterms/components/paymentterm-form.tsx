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
  sellerId: z.number().int().positive('Seller is required'),
  buyerId: z.number().int().positive('Buyer is required'),
  productId: z.number().int().positive('Product is required'),
  defermentPeriod: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  timeUnit: z.string().min(1, 'Time unit is required'),
  downPaymentRatio: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  timePeriodId: z.number().int().positive('Time period is required')
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  facilityOptions: { label: string; value: number }[];
  productOptions: { label: string; value: number }[];
  periodOptions: { label: string; value: number }[];
};

export const PaymenttermForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  facilityOptions,
  productOptions,
  periodOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {}
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
          name="sellerId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seller</FormLabel>
              <FormControl>
                <Select
                  options={facilityOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a facility"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="buyerId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Buyer</FormLabel>
              <FormControl>
                <Select
                  options={facilityOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a facility"
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
                  placeholder="Select a product"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="defermentPeriod"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deferment Period</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Deferment Period"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="downPaymentRatio"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Down Payment Ratio</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Down Payment Ratio"
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
                <Input {...field} disabled={disabled} placeholder="Time Unit" />
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
                  options={periodOptions.map((option) => ({
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
        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create Payment Term'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete Payment Term
          </Button>
        )}
      </form>
    </Form>
  );
};
