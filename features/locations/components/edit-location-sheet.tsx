import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteLocation } from '@/features/locations/api/use-delete-location';
import { useEditLocation } from '@/features/locations/api/use-edit-location';
import { useGetLocation } from '@/features/locations/api/use-get-location';

import { LocationForm } from '@/features/locations/components/location-form';
import { useOpenLocation } from '@/features/locations/hooks/use-open-location';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual location schema from your schema file


// Use the actual location schema, omitting the id field for editing
// const formSchema = locationSchema.omit({ id: true });
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

export const EditLocationSheet = () => {
  const { isOpen, onClose, id } = useOpenLocation();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this location.'
  );

  const locationQuery = useGetLocation(id);
  const editMutation = useEditLocation(id);
  const deleteMutation = useDeleteLocation(id);



  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    locationQuery.isLoading;

  const isLoading = locationQuery.isLoading || locationQuery.isLoading;

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

  const defaultValues = locationQuery.data
    ? {
        name: locationQuery.data.name,
        code: locationQuery.data.code ?? undefined,
        city: locationQuery.data.city ?? undefined,
        region: locationQuery.data.region ?? undefined,
        country: locationQuery.data.country,
        address: locationQuery.data.address ?? undefined,
        latitude: locationQuery.data.latitude ?? undefined,
        longitude: locationQuery.data.longitude ?? undefined,
        autofillCoordinates: locationQuery.data.autofillCoordinates ?? true
      }
    : {
        name: '',
        code: undefined,
        city: undefined,
        region: undefined,
        country: '',
        address: undefined,
        latitude: undefined,
        longitude: undefined,
        autofillCoordinates: true
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Location</SheetTitle>
            <SheetDescription>Edit an existing location</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <LocationForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
