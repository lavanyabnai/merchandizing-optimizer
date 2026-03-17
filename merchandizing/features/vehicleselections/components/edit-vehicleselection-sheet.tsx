import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteVehicleselection } from '@/features/vehicleselections/api/use-delete-vehicleselection';
import { useEditVehicleselection } from '@/features/vehicleselections/api/use-edit-vehicleselection';
import { useGetVehicleselection } from '@/features/vehicleselections/api/use-get-vehicleselection';
import { VehicleselectionForm } from '@/features/vehicleselections/components/vehicleselection-form';
import { useOpenVehicleselection } from '@/features/vehicleselections/hooks/use-open-vehicleselection';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';

import { useConfirm } from '@/hooks/use-confirm';

const formSchema = z.object({
  fromId: z.number(),
  toId: z.number(),
  type: z.string(),
  parameters: z.number().nullable()
});

export const EditVehicleselectionSheet = () => {
  const { isOpen, onClose, id } = useOpenVehicleselection();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this vehicleselection.'
  );

  const facilityQuery = useGetFacilities();


  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));

  const vehicleselectionQuery = useGetVehicleselection(id);
  const editMutation = useEditVehicleselection(id);
  const deleteMutation = useDeleteVehicleselection(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    vehicleselectionQuery.isLoading;

  const isLoading = vehicleselectionQuery.isLoading;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
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

  const defaultValues = vehicleselectionQuery.data
    ? {
        fromId: vehicleselectionQuery.data.fromId,
        toId: vehicleselectionQuery.data.toId,
        type: vehicleselectionQuery.data.type ?? '',
        parameters: vehicleselectionQuery.data.parameters ?? null
      }
    : {
        fromId: 0,
        toId: 0,
        type: '',
        parameters: null
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Vehicleselection</SheetTitle>
            <SheetDescription>
              Edit an existing vehicleselection
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <VehicleselectionForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilityOptions={facilityOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
