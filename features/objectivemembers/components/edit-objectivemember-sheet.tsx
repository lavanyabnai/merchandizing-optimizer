import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteobjectivemember } from '@/features/objectivemembers/api/use-delete-objectivemember';
import { useEditobjectivemember } from '@/features/objectivemembers/api/use-edit-objectivemember';
import { useGetobjectivemember } from '@/features/objectivemembers/api/use-get-objectivemember';
import { ObjectivememberForm } from '@/features/objectivemembers/components/objectivemember-form';
import { useOpenobjectivemember } from '@/features/objectivemembers/hooks/use-open-objectivemember';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual objectivemember schema from your schema file

// Use the actual objectivemember schema, omitting the id field for editing
// const formSchema = objectivememberSchema.omit({ id: true });
const ObjectivememberSchema = z.object({
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

type FormValues = z.infer<typeof ObjectivememberSchema>;

export const EditobjectivememberSheet = () => {
  const { isOpen, onClose, id } = useOpenobjectivemember();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this objectivemember.'
  );

  const objectivememberQuery = useGetobjectivemember(id);
  const editMutation = useEditobjectivemember(id);
  const deleteMutation = useDeleteobjectivemember(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    objectivememberQuery.isLoading;

  const isLoading = objectivememberQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
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

  const defaultValues = objectivememberQuery.data
    ? {
      name: objectivememberQuery.data.name ,
        expression: objectivememberQuery.data.expression ,
        coefficient: objectivememberQuery.data.coefficient ,
        addToObjective: objectivememberQuery.data.addToObjective ,
        inclusionType: objectivememberQuery.data.inclusionType ,
        customConstraintId: objectivememberQuery.data.customConstraintId
      }
    : {
        name: '',
        expression: '',
        coefficient: 0,
        addToObjective: true,
        inclusionType: '',
        customConstraintId: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Custom Constraint</SheetTitle>
            <SheetDescription>
              Edit an Existing Custom Constraint
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <ObjectivememberForm
              id={Number(id) || undefined}
              defaultValues={defaultValues as Partial<FormValues>}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
            
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}