import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteProcessingtime } from '@/features/processingtime/api/use-delete-processingtime';
import { useEditProcessingtime } from '@/features/processingtime/api/use-edit-processingtime';
import { useGetProcessingtime } from '@/features/processingtime/api/use-get-processingtime';
import { ProcessingtimeForm } from '@/features/processingtime/components/processingtime-form';
import { useOpenProcessingtime } from '@/features/processingtime/hooks/use-open-processingtime';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual processingtime schema from your schema file


const processingtimeSchema = z.object({
  facilityId: z.number().int().positive(),  
  productId: z.number().int().positive(),
  type: z.string(),
  units: z.string(),
  time:z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
  timeUnit: z.string(),
});
type FormValues = z.infer<typeof processingtimeSchema>;

export const EditProcessingtimeSheet = () => {
  const { isOpen, onClose, id } = useOpenProcessingtime();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this processingtime.'
  );

  const processingtimeQuery = useGetProcessingtime(id);
  const editMutation = useEditProcessingtime(id);
  const deleteMutation = useDeleteProcessingtime(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    processingtimeQuery.isLoading;

  const isLoading =
    processingtimeQuery.isLoading ||
    !processingtimeQuery.data;

 

    const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
      label: facilitie.name,
      value: facilitie.id
    }));
    const productOptions = (productQuery.data ?? []).map((product) => ({
      label: product.name,
      value: product.id
    }));
  
  const onSubmit = (values: FormValues) => {
    console.log('edit processingtime form', values);
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

  const defaultValues = processingtimeQuery.data
    ? {
        facilityId: processingtimeQuery.data.facilityId,
        productId: processingtimeQuery.data.productId,
        type: processingtimeQuery.data.type,
        units: processingtimeQuery.data.units,
        time: processingtimeQuery.data.time ? Number(processingtimeQuery.data.time) : undefined,
        timeUnit: processingtimeQuery.data.timeUnit,
      }
    : {
        facilityId: 0,
        productId: 0,
        type: '',
        units: '',
        time: undefined,
        timeUnit: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Processingtime</SheetTitle>
            <SheetDescription>Edit an existing processingtime</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <ProcessingtimeForm
              id={Number(id) || undefined}
              defaultValues={{
                ...defaultValues,
                time:
                  typeof defaultValues.time === 'string' && defaultValues.time === ''
                    ? undefined
                    : typeof defaultValues.time === 'string'
                    ? Number(defaultValues.time)
                    : defaultValues.time,
              }}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilitieOptions={facilitieOptions}
              productOptions={productOptions}
              />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}