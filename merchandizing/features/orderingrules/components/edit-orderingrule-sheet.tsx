import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteOrderingrule } from '@/features/orderingrules/api/use-delete-orderingrule';
import { useEditOrderingrule } from '@/features/orderingrules/api/use-edit-orderingrule';
import { useGetOrderingrule } from '@/features/orderingrules/api/use-get-orderingrule';
import { OrderingruleForm } from '@/features/orderingrules/components/orderingrule-form';
import { useOpenOrderingrule } from '@/features/orderingrules/hooks/use-open-orderingrule';
// import { useGetGroups } from '@/features/groups/api/use-get-groups';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
// import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual orderingrule schema from your schema file


const orderingruleSchema = z.object({
  destinationId: z.number().int().positive(),  
  productId: z.number().int().positive(),
  rule: z.string(),
  limitUnits: z
  .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
});
type FormValues = z.infer<typeof orderingruleSchema>;

export const EditOrderingruleSheet = () => {
  const { isOpen, onClose, id } = useOpenOrderingrule();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this orderingrule.'
  );

  const orderingruleQuery = useGetOrderingrule(id);
  const editMutation = useEditOrderingrule(id);
  const deleteMutation = useDeleteOrderingrule(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ;

  const isLoading =
    orderingruleQuery.isLoading ||
    !orderingruleQuery.data;

 

    const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
      label: facilitie.name,
      value: facilitie.id
    }));
    const productOptions = (productQuery.data ?? []).map((product) => ({
      label: product.name,
      value: product.id
    }));
   
  const onSubmit = (values: FormValues) => {
    console.log('edit orderingrule form', values);
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

  const defaultValues = orderingruleQuery.data
    ? {
        destinationId: orderingruleQuery.data.destinationId,
        productId: orderingruleQuery.data.productId,
        rule: orderingruleQuery.data.rule,
        limitUnits: orderingruleQuery.data.limitUnits,
      }
    : {
        destinationId: 0,
        productId: 0,
        rule: '',
        limitUnits: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Orderingrule</SheetTitle>
            <SheetDescription>Edit an existing orderingrule</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <OrderingruleForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
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