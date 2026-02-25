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
  leftHandSide: z.string().min(1, 'Left Hand Side is required'),
  comparisonType: z.string().min(1, 'Comparison Type is required'),
  rightHandSide: z.string().min(1, 'Right Hand Side is required'),
  constraintType: z.string().min(1, 'Constraint Type is required')
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;

};

export const CustomconstraintForm = ({
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
          name="leftHandSide"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Left Hand Side</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Left Hand Side"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="comparisonType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comparison Type</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Comparison Type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="rightHandSide"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Right Hand Side</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Right Hand Side"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="constraintType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Constraint Type</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Constraint Type"
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
