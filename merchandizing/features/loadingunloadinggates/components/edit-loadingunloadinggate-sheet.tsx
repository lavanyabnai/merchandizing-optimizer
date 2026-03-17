import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteLoadingunloadinggate } from '@/features/loadingunloadinggates/api/use-delete-loadingunloadinggate';
import { useEditLoadingunloadinggate } from '@/features/loadingunloadinggates/api/use-edit-loadingunloadinggate';
import { useGetLoadingunloadinggate } from '@/features/loadingunloadinggates/api/use-get-loadingunloadinggate';
import { LoadingunloadinggateForm } from '@/features/loadingunloadinggates/components/loadingunloadinggate-form';
import { useOpenLoadingunloadinggate } from '@/features/loadingunloadinggates/hooks/use-open-loadingunloadinggate';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual loadingunloadinggate schema from your schema file


const loadingunloadinggateSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  facilityId: z.number().int().positive(),
  type: z.string(),
  vehicleTypes: z.number().int().positive(),
  numberOfGates: z.number().int().positive(),
  units: z.string(),
  processingTime: z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
  timeUnit: z.string(),
});
type FormValues = z.infer<typeof loadingunloadinggateSchema>;

export const EditLoadingunloadinggateSheet = () => {
  const { isOpen, onClose, id } = useOpenLoadingunloadinggate();
  const facilitieQuery = useGetFacilities();
  const vehicleTypeQuery = useGetVehicleTypes();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this loadingunloadinggate.'
  );

  const loadingunloadinggateQuery = useGetLoadingunloadinggate(id);
  const editMutation = useEditLoadingunloadinggate(id);
  const deleteMutation = useDeleteLoadingunloadinggate(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    loadingunloadinggateQuery.isLoading;

  const isLoading =
    loadingunloadinggateQuery.isLoading ||
    !loadingunloadinggateQuery.data;

 

    const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
      label: facilitie.name,
      value: facilitie.id
    }));
    const vehicleTypeOptions = (vehicleTypeQuery.data ?? []).map((vehicleType: { name: string; id: number }) => ({
      label: vehicleType.name,
      value: vehicleType.id
    }));
 
  const onSubmit = (values: FormValues) => {
    console.log('edit loadingunloadinggate form', values);
    editMutation.mutate({
      ...values,
      vehicleTypes: { id: values.vehicleTypes }
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

  const defaultValues = loadingunloadinggateQuery.data
    ? {
        id: loadingunloadinggateQuery.data.id,
        name: loadingunloadinggateQuery.data.name,
        facilityId: loadingunloadinggateQuery.data.facilityId,
        vehicleTypes: Number(loadingunloadinggateQuery.data.vehicleTypes),
        numberOfGates: loadingunloadinggateQuery.data.numberOfGates,
        type: loadingunloadinggateQuery.data.type,
        units: loadingunloadinggateQuery.data.units,
        processingTime: loadingunloadinggateQuery.data.processingTime ? Number(loadingunloadinggateQuery.data.processingTime) : undefined,
        timeUnit: loadingunloadinggateQuery.data.timeUnit,
      }
    : {
        facilityId: 0,
        vehicleTypes: 0,
        type: '',
        numberOfGates: 0,
        units: '',
        processingTime: undefined,
        timeUnit: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Loadingunloadinggate</SheetTitle>
            <SheetDescription>Edit an existing loadingunloadinggate</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <LoadingunloadinggateForm
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