import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteInventory } from '@/features/inventorys/api/use-delete-inventory';
import { useEditInventory } from '@/features/inventorys/api/use-edit-inventory';
import { useGetInventory } from '@/features/inventorys/api/use-get-inventory';
import { InventoryForm } from '@/features/inventorys/components/inventory-form';
import { useOpenInventory } from '@/features/inventorys/hooks/use-open-inventory';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual inventory schema from your schema file

const inventorySchema = z.object({
  facilityId: z.number().optional(),
  productId: z.number().optional(),
  policyType: z.string().optional(),
  initialStock: z.number().optional(),
  periodicCheck: z.boolean().optional(),
  period: z.number().optional(),
  firstPeriodicCheck: z.string().optional(),
  policyBasis: z.string().optional(),
  stockCalculationWindow: z.number().optional(),
  timeUnit: z.string().optional(),
  minSplitRatio: z.number().optional(),
  timePeriodId: z.number().optional(),
  inclusionType: z.string().optional()
});

type FormValues = z.infer<typeof inventorySchema>;

export const EditInventorySheet = () => {
  const { isOpen, onClose, id } = useOpenInventory();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this inventory.'
  );


  const facilityQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const periodQuery = useGetPeriods();
  // const groupMutation = { isPending: false };

  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));

  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));

  const periodOptions = (periodQuery.data ?? []).map((period) => ({
    label: period.name,
    value: period.id
  }));

  const inventoryQuery = useGetInventory(id);
  const editMutation = useEditInventory(id);
  const deleteMutation = useDeleteInventory(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    inventoryQuery.isLoading;

  const isLoading = inventoryQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const mutationPayload = {
      ...values,
      initialStock: values.initialStock ? Number(values.initialStock) : undefined
    };
    
    editMutation.mutate(mutationPayload, {
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

  const defaultValues = inventoryQuery.data
    ? {
        periodicCheck: inventoryQuery.data.periodicCheck,
        period: inventoryQuery.data.period ?? undefined,
        firstPeriodicCheck: inventoryQuery.data.firstPeriodicCheck ?? undefined,
        policyBasis: inventoryQuery.data.policyBasis ?? undefined,
        stockCalculationWindow: inventoryQuery.data.stockCalculationWindow ?? undefined,
        timeUnit: inventoryQuery.data.timeUnit,
        inclusionType: inventoryQuery.data.inclusionType as
          | 'Include'
          | 'Exclude'
          | 'Consider'
      }
    : {
        minDcs: 0,
        maxDcs: 0,
        timePeriod: '',
        inclusionType: 'Consider' as const
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Inventory</SheetTitle>
            <SheetDescription>
              Edit an existing inventory
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <InventoryForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilityOptions={facilityOptions}
              productOptions={productOptions}
              periodOptions={periodOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
