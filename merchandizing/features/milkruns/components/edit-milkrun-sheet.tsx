import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteMilkrun } from '@/features/milkruns/api/use-delete-milkrun';
import { useEditMilkrun } from '@/features/milkruns/api/use-edit-milkrun';
import { useGetMilkrun } from '@/features/milkruns/api/use-get-milkrun';
import { MilkrunForm } from '@/features/milkruns/components/milkrun-form';
import { useOpenMilkrun } from '@/features/milkruns/hooks/use-open-milkrun';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';
import { useConfirm } from '@/hooks/use-confirm';



const milkrunSchema = z.object({
  sourceId: z.number().int().positive(),  
  vehicleTypeId: z.number().int().positive(),
  destinations: z.string()
});
type FormValues = z.infer<typeof milkrunSchema>;

export const EditMilkrunSheet = () => {
  const { isOpen, onClose, id } = useOpenMilkrun();
  const facilitieQuery = useGetFacilities();
  const vehicleTypeQuery = useGetVehicleTypes();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this milkrun.'
  );

  const milkrunQuery = useGetMilkrun(id);
  const editMutation = useEditMilkrun(id);
  const deleteMutation = useDeleteMilkrun(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    milkrunQuery.isLoading;

  const isLoading =
    milkrunQuery.isLoading ||
    !milkrunQuery.data;

 

    const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
      label: facilitie.name,
      value: facilitie.id
    }));
    const vehicleTypeOptions = (vehicleTypeQuery.data ?? []).map((vehicleType) => ({
      label: vehicleType.name,
      value: vehicleType.id
    }));
  const onSubmit = (values: FormValues) => {
    console.log('edit milkrun form', values);
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

  const defaultValues = milkrunQuery.data
    ? {
        sourceId: milkrunQuery.data.sourceId,
        vehicleTypeId: milkrunQuery.data.vehicleTypeId,
        destinations: milkrunQuery.data.destinations,
      }
    : {
        sourceId: 0,
        vehicleTypeId: 0,
        destinations: '',
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Milkrun</SheetTitle>
            <SheetDescription>Edit an existing milkrun</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <MilkrunForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilitieOptions={facilitieOptions}
              vehicleTypeOptions={vehicleTypeOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}