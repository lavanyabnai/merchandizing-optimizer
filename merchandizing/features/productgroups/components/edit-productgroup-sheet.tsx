import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteProductgroup } from '@/features/productgroups/api/use-delete-productgroup';
import { useEditProductgroup } from '@/features/productgroups/api/use-edit-productgroup';
import { useGetProductgroup } from '@/features/productgroups/api/use-get-productgroup';
import { ProductgroupForm } from '@/features/productgroups/components/productgroup-form';
import { useOpenProductgroup } from '@/features/productgroups/hooks/use-open-productgroup';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual productgroup schema from your schema file


// Use the actual productgroup schema, omitting the id field for editing
// const formSchema = productgroupSchema.omit({ id: true });
const productgroupSchema = z.object({
  name: z.string().min(1),
 
});

type FormValues = z.infer<typeof productgroupSchema>;

export const EditProductgroupSheet = () => {
  const { isOpen, onClose, id } = useOpenProductgroup();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this productgroup.'
  );

  const productgroupQuery = useGetProductgroup(id);
  const editMutation = useEditProductgroup(id);
  const deleteMutation = useDeleteProductgroup(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    productgroupQuery.isLoading;

  const isLoading = productgroupQuery.isLoading || productgroupQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    // console.log('Submitting values:', values); // Add this line
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

  const defaultValues = productgroupQuery.data
    ? {
        name: productgroupQuery.data.name,
       
      }
    : {
        name: '',
    
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Productgroup</SheetTitle>
            <SheetDescription>Edit an existing productgroup</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <ProductgroupForm
              id={Number(id) || undefined}
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
