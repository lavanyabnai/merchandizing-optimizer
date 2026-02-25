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

const formSchema = z.object({
  ifConditionId: z.number().int().optional(),
  thenConditionId: z.number().int().optional(),
  inclusionType: z.boolean()
})

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  linearrangeOptions: { label: string; value: number }[];
};

export const IndicatorconstraintForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  linearrangeOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      inclusionType: false
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
          name="ifConditionId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>IfCondition Id</FormLabel>
              <FormControl>
                <Select
                  options={linearrangeOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="IfCondition Id"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="thenConditionId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ThenCondition Id</FormLabel>
              <FormControl>
              <Select
                  options={linearrangeOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="IfCondition Id"
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
              <Select
  options={[
    { label: "True", value: "true" },
    { label: "False", value: "false" }
  ]}
  value={field.value ? "true" : "false"} // Convert boolean to string
  onChange={(value) => field.onChange(value === "true")} // Convert selected value to boolean
  disabled={disabled}
  placeholder="Select True or False"
/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create indicatorconstraint'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete indicatorconstraint
          </Button>
        )}
      </form>
    </Form>
  );
};
