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
import { useCreateVehicleType } from '@/features/vehicleTypes/api/use-create-vehicleType';
import { VehicleTypeForm } from '@/features/vehicleTypes/components/vehicleType-form';
import { useNewvehicleType } from '@/features/vehicleTypes/hooks/use-new-vehicleType';

// Assuming you have a schema for vehicleType, replace this with the actual schema
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

export const NewvehicleTypeSheet = () => {
  const { isOpen, onClose } = useNewvehicleType();

  const createMutation = useCreateVehicleType();

  // Placeholder for usevehicleType hook
  const unitsQuery = useGetUnits();
  const unitsMutation = { isPending: false }; // Replace with actual mutation
  // const onCreatevehicleType = (name: string) => {
  //   // Implement vehicleType creation logic
  // };
  const unitsOptions = (unitsQuery.data ?? []).map((unit) => ({
    label: unit.name,
    value: unit.name
  }));

  const isPending = createMutation.isPending || unitsMutation.isPending;
  const isLoading = unitsQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const transformedValues = {
      ...values,
      capacity: values.capacity ?? 0,
      capacityUnit: values.capacityUnit ?? "",
      speed: values.speed ?? 0,
      speedUnit: values.speedUnit ?? ""
    };
    createMutation.mutate(transformedValues as {
      name: string;
      capacity: number;
      capacityUnit: string;
      speed: number;
      speedUnit: string;
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New vehicleType</SheetTitle>
          <SheetDescription>Add a new vehicleType</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <VehicleTypeForm
            onSubmit={onSubmit}
            disabled={isPending}
            unitsOptions={unitsOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
