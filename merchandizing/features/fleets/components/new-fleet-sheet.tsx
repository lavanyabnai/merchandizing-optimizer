import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useCreateFleet } from '@/features/fleets/api/use-create-fleet';
import { FleetForm } from '@/features/fleets/components/fleet-form';
import { useNewFleet } from '@/features/fleets/hooks/use-new-fleet';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';

// Assuming you have a schema for fleet, replace this with the actual schema

const fleetSchema = z.object({
 facilityId: z.number().int().positive(),  
 vehicleTypeId: z.number().int().positive(),
 quantity: z.number().int().positive(),
 cost: z
 .string()
 .optional()
 .transform((val) => (val ? parseFloat(val) : undefined)),
 currency: z.string().optional(),
 timeUnit: z.string().optional()

});

type FormValues = z.infer<typeof fleetSchema>;

export const NewFleetSheet = () => {
  const { isOpen, onClose } = useNewFleet();
  const createMutation = useCreateFleet();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const facilitieQuery = useGetFacilities();
  const vehicleTypeQuery = useGetVehicleTypes();

  // Replace with actual mutation
  const facilitieMutation = { isPending: false }; // Replace with actual mutation
  const vehicleTypeMutation = { isPending: false }; // Replace with actual mutation


  const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
    label: facilitie.name,
    value: facilitie.id
  }));
  const vehicleTypeOptions = (vehicleTypeQuery.data ?? []).map((vehicleType: { name: string; id: number }) => ({
    label: vehicleType.name,
    value: vehicleType.id
  }));
  const isPending =
    createMutation.isPending ||
    facilitieMutation.isPending ||
    vehicleTypeMutation.isPending;
  const isLoading =
    facilitieQuery.isLoading ||
    vehicleTypeQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    console.log(`Form values: ${JSON.stringify(values)}`);

    // Prepare payload for mutation, ensuring cost and currency are strings
    // as per the expected type of createMutation.mutate.
    // FormValues has cost as `number | undefined` due to Zod transform,
    // and currency as `string | undefined`.
    // The mutation expects `cost: string` and `currency: string`.
    const mutationPayload = {
      ...values,
      cost: values.cost !== undefined ? String(values.cost) : "",
      currency: values.currency !== undefined ? values.currency : "",
      facilityName: facilitieOptions.find(f => f.value === values.facilityId)?.label ?? '',
      vehicleTypeName: vehicleTypeOptions.find(v => v.value === values.vehicleTypeId)?.label ?? ''
    };

    createMutation.mutate(mutationPayload, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Fleet</SheetTitle>
          <SheetDescription>Add a new fleet</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <FleetForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilitieOptions={facilitieOptions}
            vehicleTypeOptions={vehicleTypeOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
