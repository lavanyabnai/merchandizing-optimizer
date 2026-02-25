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
import { useCreateMilkrun } from '@/features/milkruns/api/use-create-milkrun';
import { MilkrunForm } from '@/features/milkruns/components/milkrun-form';
import { useNewMilkrun } from '@/features/milkruns/hooks/use-new-milkrun';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';


const milkrunSchema = z.object({
 sourceId: z.number().int().positive(),  
 vehicleTypeId: z.number().int().positive(),
 destinations: z.string()

});

type FormValues = z.infer<typeof milkrunSchema>;

export const NewMilkrunSheet = () => {
  const { isOpen, onClose } = useNewMilkrun();
  const createMutation = useCreateMilkrun();

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
    createMutation.mutate({
      ...values,
      sourceName: '',
      vehicleTypeName: '',
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
          <SheetTitle>New Milkrun</SheetTitle>
          <SheetDescription>Add a new milkrun</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <MilkrunForm
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
