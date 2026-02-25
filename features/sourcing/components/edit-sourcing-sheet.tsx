import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteSourcing } from '@/features/sourcing/api/use-delete-sourcing';
import { useEditSourcing } from '@/features/sourcing/api/use-edit-sourcing';
import { useGetSourcing } from '@/features/sourcing/api/use-get-sourcing';
import { SourcingForm } from '@/features/sourcing/components/sourcing-form';
import { useOpenSourcing } from '@/features/sourcing/hooks/use-open-sourcing';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual sourcing schema from your schema file


const sourcingSchema = z.object({
  deliveryDestination: z.string(),

  productId: z.number().int().positive(),
  type: z.string(),
  timePeriodId: z.number().int().positive(),
  inclusionType: z.string(),

});
type FormValues = z.infer<typeof sourcingSchema>;

export const EditSourcingSheet = () => {
  const { isOpen, onClose, id } = useOpenSourcing();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this sourcing.'
  );

  const sourcingQuery = useGetSourcing(id);
  const editMutation = useEditSourcing(id);
  const deleteMutation = useDeleteSourcing(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    sourcingQuery.isLoading;

  const isLoading =
    sourcingQuery.isLoading ||
    !sourcingQuery.data;

 
    const productOptions = (productQuery.data ?? []).map((product) => ({
      label: product.name,
      value: product.id
    }));
    const timePeriodOptions = (timePeriodQuery.data ?? []).map((timePeriod) => ({
      label: timePeriod.name,
      value: timePeriod.id
    }));
  const onSubmit = (values: FormValues) => {
    console.log('edit sourcing form', values);
    editMutation.mutate(values as any, {
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

  const defaultValues = sourcingQuery.data
    ? {
        deliveryDestination: sourcingQuery.data.deliveryDestination,
        productId: sourcingQuery.data.productId ?? undefined,
        type: sourcingQuery.data.type ?? undefined,
        timePeriodId: sourcingQuery.data.timePeriodId ?? undefined,
        inclusionType: sourcingQuery.data.inclusionType ?? undefined,
      }
    : {
        deliveryDestination: '',
        productId: 0,
        type: '',
        timePeriodId: 0,
        inclusionType: '',
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Sourcing</SheetTitle>
            <SheetDescription>Edit an Existing Sourcing</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <SourcingForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              productOptions={productOptions}
              timePeriodOptions={timePeriodOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}