import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteLinearrange } from '@/features/linearranges/api/use-delete-linearrange';
import { useEditLinearrange } from '@/features/linearranges/api/use-edit-linearrange';
import { useGetLinearrange } from '@/features/linearranges/api/use-get-linearrange';
import { LinearrangeForm } from '@/features/linearranges/components/linearrange-form';
import { useOpenLinearrange } from '@/features/linearranges/hooks/use-open-linearrange';

import { useConfirm } from '@/hooks/use-confirm';

const linearrangeSchema = z.object({
  name: z.string().optional(),
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

export const EditLinearrangeSheet = () => {
  const { isOpen, onClose, id } = useOpenLinearrange();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this linearrange.'
  );

  const linearrangeQuery = useGetLinearrange(id);
  const editMutation = useEditLinearrange(id);
  const deleteMutation = useDeleteLinearrange(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    linearrangeQuery.isLoading;

  const isLoading = linearrangeQuery.isLoading || linearrangeQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const transformedValues = {
      ...values,
      lowerBound: values.lowerBound ? Number(values.lowerBound) : undefined,
      upperBound: values.upperBound ? Number(values.upperBound) : undefined,
      expression: values.expression || ''
    };

    editMutation.mutate(transformedValues, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  const defaultValues = linearrangeQuery.data
    ? {
        name: linearrangeQuery.data.name,
        lowerBound: linearrangeQuery.data.lowerBound ? Number(linearrangeQuery.data.lowerBound) : undefined,
        expression: linearrangeQuery.data.expression,
        upperBound: linearrangeQuery.data.upperBound ? Number(linearrangeQuery.data.upperBound) : undefined
      }
    : {
        name: '',
        lowerBound: undefined,
        expression: '',
        upperBound: undefined
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Linearrange</SheetTitle>
            <SheetDescription>Edit an existing linearrange</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <LinearrangeForm
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
