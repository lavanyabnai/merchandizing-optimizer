import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreatePath } from '@/features/paths/api/use-create-path';
import { PathForm } from '@/features/paths/components/path-form';
import { useNewPath } from '@/features/paths/hooks/use-new-path';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';
// Assuming you have a schema for path, replace this with the actual schema

const pathSchema = z.object({
  name: z.string(),
  fromLocation: z.string(),
  toLocation: z.string(),
  costCalculationPolicy: z.string(),
  // costPuPk:z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // timeUnit: z.string().optional(),
  // straight: z.boolean(),
  // currency: z.string().optional(),
  // distance:z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // distanceUnit: z.string().optional(),
  // transportationTime:z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  vehicleTypeId: z.number().int().positive(),
  // transportationPolicy: z.string(),
  // minLoadRatio: z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // timePeriod: z.string(),
  // inclusionType: z.string(),

});

type FormValues = z.infer<typeof pathSchema>;

export const NewPathSheet = () => {
  const { isOpen, onClose } = useNewPath();
  const createMutation = useCreatePath();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const vehicleTypeQuery = useGetVehicleTypes();
  // Replace with actual mutation
  const vehicleTypeMutation = { isPending: false }; // Replace with actual mutation

  const vehicleTypeOptions = (vehicleTypeQuery.data ?? []).map((vehicleType: { name: string; id: number; }) => ({
    label: vehicleType.name,
    value: vehicleType.id
  }));

  const isPending =
    createMutation.isPending ||
    vehicleTypeMutation.isPending;
  const isLoading =
  
    vehicleTypeQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    // Find the selected vehicle type by id to get its name
    const selectedVehicleType = (vehicleTypeQuery.data ?? []).find(
      (vehicleType: { id: number }) => vehicleType.id === values.vehicleTypeId
    );

    // Compose the payload with vehicleTypeName as required by the mutation
    const payload = {
      ...values,
      vehicleTypeName: selectedVehicleType ? selectedVehicleType.name : '',
    };

    console.log(`Form values: ${JSON.stringify(payload)}`);
    createMutation.mutate(payload, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Path</SheetTitle>
          <SheetDescription>Add a New Path</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <PathForm
            onSubmit={onSubmit}
            disabled={isPending}
            vehicleTypeOptions={vehicleTypeOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
