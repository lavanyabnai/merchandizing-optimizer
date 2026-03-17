import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateVehicleselection } from '@/features/vehicleselections/api/use-create-vehicleselection';
import { VehicleselectionForm } from '@/features/vehicleselections/components/vehicleselection-form';
import { useNewVehicleselection } from '@/features/vehicleselections/hooks/use-new-vehicleselection';

import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';

const vehicleselectionSchema = z.object({
  fromId: z.number(),
  toId: z.number(),
  type: z.string(),
  parameters: z.number().nullable()
});

type FormValues = z.infer<typeof vehicleselectionSchema>;

export const NewVehicleselectionSheet = () => {
  const { isOpen, onClose } = useNewVehicleselection();
  const createMutation = useCreateVehicleselection();
  const facilityQuery = useGetFacilities();

  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));

  const isPending = createMutation.isPending;
  const isLoading = facilityQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    // Find the facility names based on the selected IDs
    const fromFacility = facilityOptions.find(option => option.value === values.fromId);
    const toFacility = facilityOptions.find(option => option.value === values.toId);

    createMutation.mutate(
      {
        ...values,
        fromName: fromFacility?.label ?? '',
        toName: toFacility?.label ?? ''
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
          <SheetTitle>New Vehicle Selection</SheetTitle>
          <SheetDescription>Add a New Vehicle Selection</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <VehicleselectionForm 
           onSubmit={onSubmit}
           disabled={isPending} 
           facilityOptions={facilityOptions}
           defaultValues={{
             fromId: 0,
             toId: 0,
             type: '',
             parameters: null
           }} />
        )}
      </SheetContent>
    </Sheet>
  );
};
