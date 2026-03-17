import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateLocation } from '@/features/locations/api/use-create-location';
import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { LocationForm } from '@/features/locations/components/location-form';
import { useNewLocation } from '@/features/locations/hooks/use-new-location';

// Assuming you have a schema for location, replace this with the actual schema
const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  autofillCoordinates: z.boolean().default(true)
});

type FormValues = z.infer<typeof locationSchema>;

export const NewLocationSheet = () => {
  const { isOpen, onClose } = useNewLocation();
  
  const createMutation = useCreateLocation();

  // Placeholder for useLocation hook
  const locationQuery = useGetLocations();
  const locationMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateLocation = (name: string) => {
  //   // Implement location creation logic
  // };

  const isPending = createMutation.isPending || locationMutation.isPending;
  const isLoading = locationQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Location</SheetTitle>
          <SheetDescription>Add a new location</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <LocationForm
            onSubmit={onSubmit}
            disabled={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
