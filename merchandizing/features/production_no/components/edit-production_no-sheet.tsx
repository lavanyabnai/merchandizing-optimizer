import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteProduction_no } from '@/features/production_no/api/use-delete-production_no';
import { useEditProduction_no } from '@/features/production_no/api/use-edit-production_no';
import { useGetProduction_no } from '@/features/production_no/api/use-get-production_no';
import { Production_noForm } from '@/features/production_no/components/production_no-form';
import { useOpenProduction_no } from '@/features/production_no/hooks/use-open-production_no';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual production_no schema from your schema file


const production_noSchema = z.object({
  label: z.string(),
  siteId: z.number().int().positive(),  
  productId: z.number().int().positive(),
  inclusionType: z.string(),
  currency: z.string().optional(),
});
type FormValues = z.infer<typeof production_noSchema>;

export const EditProduction_noSheet = () => {
  const { isOpen, onClose, id } = useOpenProduction_no();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  // const bomQuery = useGetPeriods();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this production_no.'
  );

  const production_noQuery = useGetProduction_no(id);
  const editMutation = useEditProduction_no(id);
  const deleteMutation = useDeleteProduction_no(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    production_noQuery.isLoading;

  const isLoading =
    production_noQuery.isLoading ||
    !production_noQuery.data;

 

    const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
      label: facilitie.name,
      value: facilitie.id
    }));
 
    const productOptions = (productQuery.data ?? []).map((product) => ({
      label: product.name,
      value: product.id
    }));
    // const bomOptions = (bomQuery.data ?? []).map((bom) => ({
    //   label: bom.name,
    //   value: bom.id
    // }));
  const onSubmit = (values: FormValues) => {
    console.log('edit production_no form', values);
    editMutation.mutate({
      ...values,
      bomId: 0, // Add a default value for bomId
      minThroughput: 0,
      maxThroughput: 0,
      periodId: 0,
      productionCost: 0
    }, {
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

  const defaultValues = production_noQuery.data
    ? {
        label: production_noQuery.data.label,
        siteId: production_noQuery.data.siteId,
        productId: production_noQuery.data.productId,
        inclusionType: production_noQuery.data.inclusionType,
        currency: production_noQuery.data.currency,
      }
    : {
        label: '',
        siteId: 0,
        productId: 0,
        currency: '',
        inclusionType: '',
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Production_no</SheetTitle>
            <SheetDescription>Edit an existing production_no</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <Production_noForm
              id={Number(id)}
              defaultValues={{
                ...defaultValues,
                currency: defaultValues.currency || undefined
              }}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              // locationOptions={locationOptions}
              facilitieOptions={facilitieOptions}
              productOptions={productOptions}
             
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}