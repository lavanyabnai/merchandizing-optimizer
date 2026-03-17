import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateobjectivemember } from '@/features/objectivemembers/api/use-create-objectivemember';
import { ObjectivememberForm } from '@/features/objectivemembers/components/objectivemember-form';
import { useNewobjectivemember } from '@/features/objectivemembers/hooks/use-new-objectivemember';

const objectivememberSchema = z.object({
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
    .optional(),
});

type FormValues = z.infer<typeof objectivememberSchema>;

export const NewobjectivememberSheet = () => {
  const { isOpen, onClose } = useNewobjectivemember();
  const createMutation = useCreateobjectivemember();

  const isPending = createMutation.isPending;
  const isLoading = false;

  const onSubmit = (values: FormValues) => {
    console.log('Submitting values:', values);

    createMutation.mutate(
      {
        ...values,
        name: values.name ?? '',
        expression: values.expression ?? '',
        coefficient: values.coefficient ? values.coefficient.toString() : null,
        addToObjective: values.addToObjective ?? null,
        inclusionType: values.inclusionType ?? null,
        customConstraintId: values.customConstraintId ?? null,
      },
      {
        onSuccess: () => {
          console.log('Successfully created objective member');
          onClose();
        },
        onError: (error) => {
          console.error('Error creating objective member:', error);
        }
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Objective Members</SheetTitle>
          <SheetDescription>Add a new Objective Members</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <ObjectivememberForm onSubmit={onSubmit} disabled={isPending} />
        )}
      </SheetContent>
    </Sheet>
  );
};