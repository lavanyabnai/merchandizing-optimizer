import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteDistancebydemand } from '@/features/distancebydemands/api/use-delete-distancebydemand';
import { useEditDistancebydemand } from '@/features/distancebydemands/api/use-edit-distancebydemand';

import { DistancebydemandForm } from '@/features/distancebydemands/components/distancebydemand-form';

import { useOpenDistancebydemand } from '@/features/distancebydemands/hooks/use-open-distancebydemand';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';

import { useConfirm } from '@/hooks/use-confirm';
import { useGetdistancebydemand } from '@/features/distancebydemands/api/use-get-distancebydemand';

const distancebydemandSchema = z.object({
  siteId: z.number().optional(),
  siteName: z
    .string()
    .optional(),
  demandPercentage: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  demandM3: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  distanceToSiteKm: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
});

type FormValues = z.infer<typeof distancebydemandSchema>;

export const EditDistancebydemandSheet = () => {
  const { isOpen, onClose, id } = useOpenDistancebydemand();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this distancebydemand.'
  );

  const distancebydemandQuery = useGetdistancebydemand(id);
  const editMutation = useEditDistancebydemand(id);
  const deleteMutation = useDeleteDistancebydemand(id);

  const facilityQuery = useGetFacilities();
  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    distancebydemandQuery.isLoading;

  const isLoading = distancebydemandQuery.isLoading || facilityQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    editMutation.mutate({
      ...values,
      siteId: values.siteId ?? 0
    }, {
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

  const defaultValues = distancebydemandQuery.data
    ? {
        siteId: distancebydemandQuery.data.siteId || 0,
        siteName: distancebydemandQuery.data.siteName || '',
        demandPercentage: distancebydemandQuery.data.demandPercentage || 0,
        demandM3: distancebydemandQuery.data.demandM3 || 0,
        distanceToSiteKm: distancebydemandQuery.data.distanceToSiteKm || 0
      }
    : {
        siteId: 0,
        siteName: '',
        demandPercentage: 0,
        demandM3: 0,
        distanceToSiteKm: 0
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Distancebydemand</SheetTitle>
            <SheetDescription>
              Edit an existing distancebydemand
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <DistancebydemandForm
              id={Number(id) || undefined}
              defaultValues={defaultValues as Partial<FormValues>}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilityOptions={facilityOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
