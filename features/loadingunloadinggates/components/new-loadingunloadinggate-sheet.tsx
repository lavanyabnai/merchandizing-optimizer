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
import { useCreateLoadingunloadinggate } from '@/features/loadingunloadinggates/api/use-create-loadingunloadinggate';
import { LoadingunloadinggateForm } from '@/features/loadingunloadinggates/components/loadingunloadinggate-form';
import { useNewLoadingunloadinggate } from '@/features/loadingunloadinggates/hooks/use-new-loadingunloadinggate';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';

// Assuming you have a schema for loadingunloadinggate, replace this with the actual schema

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

export const NewLoadingunloadinggateSheet = () => {
  const { isOpen, onClose } = useNewLoadingunloadinggate();
  const createMutation = useCreateLoadingunloadinggate();

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
  const vehicleTypeOptions = (vehicleTypeQuery.data ?? []).map((vehicleType) => ({
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
    createMutation.mutate({
      ...values,
      processingTime: values.processingTime ? String(values.processingTime) : '',
      facilityName: ''
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
          <SheetTitle>New Loadingunloadinggate</SheetTitle>
          <SheetDescription>Add a new loadingunloadinggate</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <LoadingunloadinggateForm
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
