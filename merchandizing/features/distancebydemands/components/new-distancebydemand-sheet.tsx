import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateDistancebydemand } from '@/features/distancebydemands/api/use-create-distancebydemand';
import { DistancebydemandForm } from '@/features/distancebydemands/components/distancebydemand-form';
import { useNewDistancebydemand } from '@/features/distancebydemands/hooks/use-new-distancebydemand';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';


const distancebydemandSchema = z.object({
  siteId: z.number(),
  siteName: z.string(),
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

export const NewDistancebydemandSheet = () => {
  const { isOpen, onClose } = useNewDistancebydemand();
  const createMutation = useCreateDistancebydemand();

  const facilityQuery = useGetFacilities();
  const facilityOptions = (facilityQuery.data ?? []).map((facility: { name: any; id: any; }) => ({
    label: facility.name,
    value: facility.id
  }));

  const isPending = createMutation.isPending || facilityQuery.isPending;
  const isLoading = facilityQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const formattedValues = {
      ...values,
      siteName: values.siteName || facilityOptions.find(opt => opt.value === values.siteId)?.label || '',
      demandPercentage: values.demandPercentage ? values.demandPercentage.toString() : null,
      demandM3: values.demandM3 ? values.demandM3.toString() : null,
      distanceToSiteKm: values.distanceToSiteKm ? values.distanceToSiteKm.toString() : null,
      facilityName: facilityOptions.find(opt => opt.value === values.siteId)?.label || ''
    };
    createMutation.mutate(formattedValues, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Distance by Demand</SheetTitle>
          <SheetDescription>Add a New Distance by Demand</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <DistancebydemandForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilityOptions={facilityOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
