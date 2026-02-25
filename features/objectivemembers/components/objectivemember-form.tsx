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
  name: z.string().optional(),
  expression: z.string().optional(),
  coefficient: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  addToObjective: z.boolean().optional(),
  inclusionType: z.string().optional(),
  customConstraintId: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .optional()
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;

};

export const ObjectivememberForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,

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
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Name"
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
          name="coefficient"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Co Efficient</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Co Efficient"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="addToObjective"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add To Objective</FormLabel>
              <FormControl>
              <Select
options={[
  { label: "True", value: "true" },
  { label: "False", value: "false" }
]}
value={field.value ? "true" : "false"} 
onChange={(value) => field.onChange(value === "true")} 
disabled={disabled}
placeholder="Select True or False"
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
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Inclusion Type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="customConstraintId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Constraint Id</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Custom Constraint Id"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create Customs Constraint'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete Customs Constraint
          </Button>
        )}
      </form>
    </Form>
  );
};
