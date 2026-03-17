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
import { useCreateSitestatechange } from '@/features/sitestatechanges/api/use-create-sitestatechange';
import { useNewSitestatechange } from '@/features/sitestatechanges/hooks/use-new-sitestatechange';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { SitestatechangeForm } from './sitestatechange-form';

// Assuming you have a schema for sitestatechange, replace this with the actual schema

const sitestatechangeSchema = z.object({
  siteId: z.number().int().positive(),
  timePeriodId: z.number().int().positive(),
  newSiteState: z.string(),
});

type FormValues = z.infer<typeof sitestatechangeSchema>;

export const NewSitestatechangeSheet = () => {
  const { isOpen, onClose } = useNewSitestatechange();
  const createMutation = useCreateSitestatechange();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const facilitiesQuery = useGetFacilities();
  const periodsQuery = useGetPeriods();
  // const timePeriodQuery = useGetPeriods();
  // // Replace with actual mutation
  const facilitiesMutation = { isPending: false }; // Replace with actual mutation
  const periodsMutation = { isPending: false }; // Replace with actual mutation
  // const timePeriodMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateLocation = (name: string) => {
  //   // Implement location creation logic
  // };
  // const locationOptions = (locationQuery.data ?? []).map((location) => ({
  //   label: location.name,
  //   value: location.id
  // }));
  const facilitiesOptions = (facilitiesQuery.data ?? []).map((facilities: { name: string; id: number }) => ({
    label: facilities.name,
    value: facilities.id
  }));
  const periodsOptions = (periodsQuery.data ?? []).map((periods: { name: string; id: number }) => ({
    label: periods.name,
    value: periods.id
  }));
  // const timePeriodOptions = (timePeriodQuery.data ?? []).map((timePeriod) => ({
  //   label: timePeriod.name,
  //   value: timePeriod.id
  // }));

  const isPending =
    createMutation.isPending ||
    facilitiesMutation.isPending ||
    periodsMutation.isPending;
  const isLoading =
    facilitiesQuery.isLoading ||
    periodsQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    console.log(`Form values: ${JSON.stringify(values)}`);

    // Find the facility and period names based on the selected IDs
    const facility = facilitiesOptions.find(f => f.value === values.siteId);
    const period = periodsOptions.find(p => p.value === values.timePeriodId);

    // Compose the payload with the required fields
    const payload = {
      ...values,
      siteName: facility ? facility.label : '',
      timePeriodName: period ? period.label : '',
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        onClose();
      }
    });
  };



  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Sitestatechange</SheetTitle>
          <SheetDescription>Add a new sitestatechange</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <SitestatechangeForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilitiesOptions={facilitiesOptions}
            periodsOptions={periodsOptions}
            // timePeriodOptions={timePeriodOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
