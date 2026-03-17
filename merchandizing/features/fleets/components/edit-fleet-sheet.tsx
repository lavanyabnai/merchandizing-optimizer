import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteFleet } from '@/features/fleets/api/use-delete-fleet';
import { useEditFleet } from '@/features/fleets/api/use-edit-fleet';
import { useGetFleet } from '@/features/fleets/api/use-get-fleet';
import { FleetForm } from '@/features/fleets/components/fleet-form';
import { useOpenFleet } from '@/features/fleets/hooks/use-open-fleet';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';
import { useConfirm } from '@/hooks/use-confirm';



const fleetSchema = z.object({
  facilityId  : z.number().int().positive(),  
  vehicleTypeId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  cost:z
  .string()
  .optional()
  .transform((val) => (val ? parseFloat(val) : undefined)),
  currency: z.string().optional(),
  timeUnit: z.string().optional()
});
type FormValues = z.infer<typeof fleetSchema>;

export const EditFleetSheet = () => {
  const { isOpen, onClose, id } = useOpenFleet();
  const facilitieQuery = useGetFacilities();
  const vehicleTypeQuery = useGetVehicleTypes();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this fleet.'
  );

  const fleetQuery = useGetFleet(id);
  const editMutation = useEditFleet(id);
  const deleteMutation = useDeleteFleet(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    fleetQuery.isLoading;

  const isLoading =
    fleetQuery.isLoading ||
    !fleetQuery.data;

 

    const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
      label: facilitie.name,
      value: facilitie.id
    }));
    const vehicleTypeOptions = (vehicleTypeQuery.data ?? []).map((vehicleType) => ({
      label: vehicleType.name,
      value: vehicleType.id
    }));
  const onSubmit = (values: FormValues) => {
    console.log('edit fleet form', values);
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

  const defaultValues = fleetQuery.data
    ? {
        facilityId: fleetQuery.data.facilityId,
        vehicleTypeId: fleetQuery.data.vehicleTypeId,
        quantity: fleetQuery.data.quantity,
        cost: fleetQuery.data.cost,
        currency: fleetQuery.data.currency,
        timeUnit: fleetQuery.data.timeUnit,
      }
    : {
        facilityId: 0,
        vehicleTypeId: 0,
        quantity: 0,
        cost: 0,
        currency: '',
        timeUnit: '',
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Fleet</SheetTitle>
            <SheetDescription>Edit an existing fleet</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <FleetForm
              id={Number(id) || undefined}
              defaultValues={defaultValues as Partial<FormValues>}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilitieOptions={facilitieOptions}
              vehicleTypeOptions={vehicleTypeOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}