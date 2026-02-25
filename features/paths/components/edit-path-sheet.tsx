import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeletePath } from '@/features/paths/api/use-delete-path';
import { useEditPath } from '@/features/paths/api/use-edit-path';
import { useGetPath } from '@/features/paths/api/use-get-path';
import { PathForm } from '@/features/paths/components/path-form';
import { useOpenPath } from '@/features/paths/hooks/use-open-path';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual path schema from your schema file


const pathSchema = z.object({
  name: z.string(),
  fromLocation: z.string(),
  toLocation: z.string(),
  costCalculationPolicy: z.string(),
  costPuPk: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
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
  vehicleTypeId: z.number().int().positive().optional(),
  // transportationPolicy: z.string(),
  // minLoadRatio: z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // timePeriod: z.string(),
  // inclusionType: z.string(),
});
type FormValues = z.infer<typeof pathSchema>;

export const EditPathSheet = () => {
  const { isOpen, onClose, id } = useOpenPath();
  const vehicleTypeQuery = useGetVehicleTypes();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this path.'
  );

  const pathQuery = useGetPath(id);
  const editMutation = useEditPath(id);
  const deleteMutation = useDeletePath(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    pathQuery.isLoading;

  const isLoading =
    pathQuery.isLoading ||
    !pathQuery.data;

 

    const vehicleTypeOptions = (vehicleTypeQuery.data ?? []).map((vehicleType) => ({
      label: vehicleType.name,
      value: vehicleType.id
    }));
  const onSubmit = (values: FormValues) => {
    console.log('edit path form', values);
    editMutation.mutate({
      ...values,
      vehicleTypeId: values.vehicleTypeId ?? undefined
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

  const defaultValues = pathQuery.data
    ? {
        name: pathQuery.data.name,
        fromLocation: pathQuery.data.fromLocation,
        toLocation: pathQuery.data.toLocation,
        costCalculationPolicy: pathQuery.data.costCalculationPolicy,
        // costPuPk: pathQuery.data.costPuPk,
        // timeUnit: pathQuery.data.timeUnit,
        // straight: pathQuery.data.straight,
        // currency: pathQuery.data.currency,
        // distance: pathQuery.data.distance,
        // distanceUnit: pathQuery.data.distanceUnit,
        // transportationTime: pathQuery.data.transportationTime,
        vehicleTypeId: pathQuery.data.vehicleTypeId ?? undefined,
        // transportationPolicy: pathQuery.data.transportationPolicy,
        // minLoadRatio: pathQuery.data.minLoadRatio,
        // timePeriod: pathQuery.data.timePeriod,
        // inclusionType: pathQuery.data.inclusionType,
      }
    : {
        name: '',
        fromLocation: '',
        toLocation: '',
        costCalculationPolicy: '',
        // costPuPk: '',
        // timeUnit: '',
        // straight: false,
        // currency: '',
        // distance: '',
        // distanceUnit: '',
        // transportationTime: '',
        vehicleTypeId: undefined,
        // transportationPolicy: '',
        // minLoadRatio: '',
        // timePeriod: '',
        // inclusionType: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Path</SheetTitle>
            <SheetDescription>Edit an existing path</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <PathForm
              id={Number(id) || undefined}
              defaultValues={defaultValues as Partial<FormValues>}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              vehicleTypeOptions={vehicleTypeOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}