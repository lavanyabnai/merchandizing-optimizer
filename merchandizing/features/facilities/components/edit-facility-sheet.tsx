import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteFacility } from '@/features/facilities/api/use-delete-facility';
import { useEditFacility } from '@/features/facilities/api/use-edit-facility';
import { useGetFacility } from '@/features/facilities/api/use-get-facility';
import { FacilityForm } from '@/features/facilities/components/facility-form';
import { useOpenFacility } from '@/features/facilities/hooks/use-open-facility';
import { useGetLocations } from '@/features/locations/api/use-get-locations';

import { useConfirm } from '@/hooks/use-confirm';


// Define the facility schema
const facilitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  locationId: z.number().int().positive('Location is required'),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']),
  capacity: z.number().optional(),
  capacityUnit: z.string().optional(),
  aggregateOrdersByLocation: z.boolean().optional(),
  additionalParams: z.record(z.unknown()).optional(),
  icon: z.string().optional()
});

type FormValues = z.infer<typeof facilitySchema>;

export const EditFacilitySheet = () => {
  const { isOpen, onClose, id } = useOpenFacility();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this facility.'
  );

  const facilityQuery = useGetFacility(id);
  const editMutation = useEditFacility(id);
  const deleteMutation = useDeleteFacility(id);

  const locationQuery = useGetLocations();
  const locationOptions = (locationQuery.data ?? []).map((location) => ({
    label: location.name,
    value: location.id
  }));

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    facilityQuery.isLoading;

  const isLoading = facilityQuery.isLoading || locationQuery.isLoading;

  const onSubmit = (values: FormValues) => {
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

  const defaultValues = facilityQuery.data
    ? {
        name: facilityQuery.data.name,
        type: facilityQuery.data.type ?? undefined,
        locationId: facilityQuery.data.locationId,
        inclusionType: facilityQuery.data.inclusionType,
        capacity: facilityQuery.data.capacity
          ? String(facilityQuery.data.capacity)
          : undefined,
        capacityUnit: facilityQuery.data.capacityUnit ?? undefined,
        aggregateOrdersByLocation:
          facilityQuery.data.aggregateOrdersByLocation ?? undefined,
        additionalParams: facilityQuery.data.additionalParams ?? undefined,
        icon: facilityQuery.data.icon ?? undefined
      }
    : {
        name: '',
        type: undefined,
        locationId: 0,
        inclusionType: 'Include',
        capacity: undefined,
        capacityUnit: undefined,
        aggregateOrdersByLocation: undefined,
        additionalParams: undefined,
        icon: undefined
      };

  //   ? {
  //     name: locationQuery.data.name,
  //     code: locationQuery.data.code ?? undefined,
  //     city: locationQuery.data.city ?? undefined,
  //     region: locationQuery.data.region ?? undefined,
  //     country: locationQuery.data.country,
  //     address: locationQuery.data.address ?? undefined,
  //     latitude: locationQuery.data.latitude ?? undefined,
  //     longitude: locationQuery.data.longitude ?? undefined,
  //     autofillCoordinates: locationQuery.data.autofillCoordinates ?? true
  //   }
  // : {
  //     name: '',
  //     code: undefined,
  //     city: undefined,
  //     region: undefined,
  //     country: '',
  //     address: undefined,
  //     latitude: undefined,
  //     longitude: undefined,
  //     autofillCoordinates: true
  //   };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Facility</SheetTitle>
            <SheetDescription>Edit an existing facility</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <FacilityForm
              id={Number(id) || undefined}
              defaultValues={defaultValues as Partial<FormValues>}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              locationOptions={locationOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
