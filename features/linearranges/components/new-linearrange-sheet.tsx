import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateLinearrange } from '@/features/linearranges/api/use-create-linearrange';
import { useGetLinearranges } from '@/features/linearranges/api/use-get-linearranges';
import { LinearrangeForm } from '@/features/linearranges/components/linearrange-form';
import { useNewLinearrange } from '@/features/linearranges/hooks/use-new-linearrange';


const linearrangeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  lowerBound: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  expression: z.string().optional(),
  upperBound: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
});

type FormValues = z.infer<typeof linearrangeSchema>;

export const NewLinearrangeSheet = () => {
  const { isOpen, onClose } = useNewLinearrange();

  const createMutation = useCreateLinearrange();

  // Placeholder for useLinearrange hook
  const linearrangeQuery = useGetLinearranges();
  const linearrangeMutation = { isPending: false }; // Replace with actual mutation

  const isPending = createMutation.isPending || linearrangeMutation.isPending;
  const isLoading = linearrangeQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const transformedValues = {
      ...values,
      lowerBound: values.lowerBound?.toString() || '',
      upperBound: values.upperBound?.toString() || '',
      expression: values.expression || ''
    };

    createMutation.mutate(transformedValues, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Linearrange</SheetTitle>
          <SheetDescription>Add a new linearrange</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <LinearrangeForm
            onSubmit={onSubmit}
            disabled={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
