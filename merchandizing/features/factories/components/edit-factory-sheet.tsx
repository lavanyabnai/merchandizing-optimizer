import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteFactory } from '@/features/factories/api/use-delete-factory';
import { useEditFactory } from '@/features/factories/api/use-edit-factory';
import { useGetFactory } from '@/features/factories/api/use-get-factory';
import { FactoryForm } from '@/features/factories/components/factory-form';
import { useOpenFactory } from '@/features/factories/hooks/use-open-factory';
import { useConfirm } from '@/hooks/use-confirm';
import { useGetLocations } from '@/features/locations/api/use-get-locations';
// Match the actual database schema for factories
const factorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  locationId: z.number().int().positive('Location is required'),
  locationName: z.string().optional(),
  initiallyOpen: z.boolean().optional(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']),
  capacity: z.string().optional(),
  capacityUnit: z.string().optional(),
  priority: z.string().optional(),
  aggregateOrdersByLocation: z.boolean().optional(),
  additionalParameters: z.number().optional(),
  icon: z.string().optional()
});

type FormValues = z.infer<typeof factorySchema>;

export const EditFactorySheet = () => {
  const { isOpen, onClose, id } = useOpenFactory();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this factory.'
  );

  const factoryQuery = useGetFactory(id);
  const editMutation = useEditFactory(id);
  const deleteMutation = useDeleteFactory(id);
  const { data: locations = [] } = useGetLocations();
  const locationOptions = locations.map((location) => ({
    label: location.name,
    value: location.id
  }));

  const isPending =
    editMutation.isPending || deleteMutation.isPending || factoryQuery.isLoading;

  const isLoading = factoryQuery.isLoading;

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

        const defaultValues = factoryQuery.data
    ? {
        name: factoryQuery.data.name,
        type: factoryQuery.data.type || 'Factory',
        locationId: factoryQuery.data.locationId,
        locationName: factoryQuery.data.locationName ?? undefined,
        initiallyOpen: factoryQuery.data.initiallyOpen ?? true,
        inclusionType: (factoryQuery.data.inclusionType || 'Include') as 'Include' | 'Exclude' | 'Consider',
        capacity: factoryQuery.data.capacity || '',
        capacityUnit: factoryQuery.data.capacityUnit || '',
        priority: factoryQuery.data.priority || 'Equal',
        aggregateOrdersByLocation: factoryQuery.data.aggregateOrdersByLocation ?? false,
        additionalParameters: factoryQuery.data.additionalParameters || 0,
        icon: factoryQuery.data.icon || 'FACTORY'
      }
    : {
        name: '',
        type: 'Factory',
        locationId: 0,
        locationName: '',
        initiallyOpen: true,
        inclusionType: 'Include' as const,
        capacity: '',
        capacityUnit: '',
        priority: 'Equal',
        aggregateOrdersByLocation: false,
        additionalParameters: 0,
        icon: 'FACTORY'
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Factory</SheetTitle>
            <SheetDescription>Edit an existing factory</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <FactoryForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
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
