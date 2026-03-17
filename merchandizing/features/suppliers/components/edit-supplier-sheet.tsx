import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteSupplier } from '@/features/suppliers/api/use-delete-supplier';
import { useEditSupplier } from '@/features/suppliers/api/use-edit-supplier';
import { useGetSupplier } from '@/features/suppliers/api/use-get-supplier';
import { SupplierForm } from '@/features/suppliers/components/supplier-form';
import { useOpenSupplier } from '@/features/suppliers/hooks/use-open-supplier';
import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useConfirm } from '@/hooks/use-confirm';

const supplierSchema = z.object({
  name: z.string().optional(),
  type:z.string(),
  locationId :z.number().optional(),
  products :z.record(z.unknown()).optional(),
  inclusionType :z.enum(['Include', 'Exclude', 'Consider']),
  additionalParameters :z.record(z.unknown()).optional(),
  icon :z.string().optional()
});

type FormValues = z.infer<typeof supplierSchema>;

export const EditSupplierSheet = () => {
  const { isOpen, onClose, id } = useOpenSupplier();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this supplier.'
  );

  const supplierQuery = useGetSupplier(id);
  const editMutation = useEditSupplier(id);
  const deleteMutation = useDeleteSupplier(id);


  const locationQuery = useGetLocations();
  const locationOptions = (locationQuery.data ?? []).map((location) => ({
    label: location.name,
    value: location.id
  }));

  
  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    supplierQuery.isLoading;

  const isLoading = supplierQuery.isLoading || supplierQuery.isLoading;

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

  const defaultValues = supplierQuery.data
    ? {
        name: supplierQuery.data.name,
        type: supplierQuery.data.type ?? '',
        locationId: supplierQuery.data.locationId ?? undefined,
        products: supplierQuery.data.products ?? {},
        inclusionType: (supplierQuery.data.inclusionType ?? 'Include') as 'Include' | 'Exclude' | 'Consider',
        additionalParameters: supplierQuery.data.additionalParameters ?? {},
        icon: supplierQuery.data.icon ?? ''
      }
    : {
        name: '',
        type: '',
        locationId: 0,
        products: {},
        inclusionType: 'Include' as const,
        additionalParameters: {},
        icon: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Supplier</SheetTitle>
            <SheetDescription>Edit an existing supplier</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <SupplierForm
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              locationOptions={locationOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
