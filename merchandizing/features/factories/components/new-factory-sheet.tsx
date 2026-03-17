import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateFactory } from '@/features/factories/api/use-create-factory';
import { useGetFactories } from '@/features/factories/api/use-get-factories';
import { FactoryForm } from '@/features/factories/components/factory-form';
import { useNewFactory } from '@/features/factories/hooks/use-new-factory';
import { useGetLocations } from '@/features/locations/api/use-get-locations';
// Assuming you have a schema for group, replace this with the actual schema

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

export const NewFactorySheet = () => {
  const { isOpen, onClose } = useNewFactory();

  const createMutation = useCreateFactory();
  const { data: locations = [] } = useGetLocations();
  const locationOptions = locations.map((location) => ({
    label: location.name,
    value: location.id
  }));
  // Placeholder for useGroup hook
  const factoryQuery = useGetFactories();
  const groupMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateGroup = (name: string) => {
  //   // Implement group creation logic
  // };

  const isPending = createMutation.isPending || groupMutation.isPending;
  const isLoading = factoryQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      ...values,
      locationName: values.locationName || ''
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  // Add default values
  const defaultValues = {
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Factory</SheetTitle>
          <SheetDescription>Add a new factory</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <FactoryForm
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            disabled={isPending}
            locationOptions={locationOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
