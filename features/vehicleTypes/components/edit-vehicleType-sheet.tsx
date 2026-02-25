import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useGetUnits } from '@/features/units/api/use-get-units';
import { useDeletevehicleType } from '@/features/vehicleTypes/api/use-delete-vehicleType';
import { useEditvehicleType } from '@/features/vehicleTypes/api/use-edit-vehicleType';
import { useGetvehicleType } from '@/features/vehicleTypes/api/use-get-vehicleType';
import { VehicleTypeForm } from '@/features/vehicleTypes/components/vehicleType-form';
import { useOpenvehicleType } from '@/features/vehicleTypes/hooks/use-open-vehicleType';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual vehicleType schema from your schema file


// Use the actual vehicleType schema, omitting the id field for editing
// const formSchema = vehicleTypeSchema.omit({ id: true });
const vehicleTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  capacity: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  capacityUnit: z.string().optional(),
  speed: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  speedUnit: z.string().optional()
});

type FormValues = z.infer<typeof vehicleTypeSchema>;

export const EditvehicleTypeSheet = () => {
  const { isOpen, onClose, id } = useOpenvehicleType();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this vehicleType.'
  );

  const vehicleTypeQuery = useGetvehicleType(id);
  const editMutation = useEditvehicleType(id);
  const deleteMutation = useDeletevehicleType(id);

 const unitsQuery = useGetUnits();
   const unitsOptions = (unitsQuery.data ?? []).map((unit) => ({
     label: unit.name,
     value: unit.name
   }));


  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    vehicleTypeQuery.isLoading;

  const isLoading = vehicleTypeQuery.isLoading || vehicleTypeQuery.isLoading;

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

  const defaultValues = vehicleTypeQuery.data
    ? {
        name: vehicleTypeQuery.data.name,
        capacity: vehicleTypeQuery.data.capacity ? Number(vehicleTypeQuery.data.capacity) : undefined,
        capacityUnit: vehicleTypeQuery.data.capacityUnit ?? undefined,
        speed: vehicleTypeQuery.data.speed ? Number(vehicleTypeQuery.data.speed) : undefined,
        speedUnit: vehicleTypeQuery.data.speedUnit ?? undefined
      }
    : {
        name: '',
        capacity: undefined,
        capacityUnit: '',
        speed: undefined,
        speedUnit: '',
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit vehicleType</SheetTitle>
            <SheetDescription>Edit an existing vehicleType</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <VehicleTypeForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              unitsOptions={unitsOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
