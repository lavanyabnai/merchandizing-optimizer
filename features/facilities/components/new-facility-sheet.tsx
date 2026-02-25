import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateFacility } from '@/features/facilities/api/use-create-facility';
import { FacilityForm } from '@/features/facilities/components/facility-form';
import { useNewFacility } from '@/features/facilities/hooks/use-new-facility';
import { useGetLocations } from '@/features/locations/api/use-get-locations';

// Assuming you have a schema for facility, replace this with the actual schema
const facilitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  locationId: z.number().int().positive("Location is required"),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']),
  capacity: z.number().optional(),
  capacityUnit: z.string().optional()
});

type FormValues = z.infer<typeof facilitySchema>;

export const NewFacilitySheet = () => {
  const { isOpen, onClose } = useNewFacility();
  const createMutation = useCreateFacility();

  // Placeholder for useLocation hook
  const locationQuery = useGetLocations();
  const locationMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateLocation = (name: string) => {
  //   // Implement location creation logic
  // };
  const locationOptions = (locationQuery.data ?? []).map((location) => ({
    label: location.name,
    value: location.id
  }));

  const isPending = createMutation.isPending || locationMutation.isPending;
  const isLoading = locationQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const selectedLocation = (locationQuery.data ?? []).find(
      (location) => location.id === values.locationId
    );
    const locationName = selectedLocation ? selectedLocation.name : '';

    createMutation.mutate(
      {
        ...values,
        locationName
      },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Facility</SheetTitle>
          <SheetDescription>Add a new facility</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <FacilityForm
            onSubmit={onSubmit}
            disabled={isPending}
            locationOptions={locationOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
