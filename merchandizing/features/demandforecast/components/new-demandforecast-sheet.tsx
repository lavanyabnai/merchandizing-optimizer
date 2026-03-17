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
import { useCreateDemandforecast } from '@/features/demandforecast/api/use-create-demandforecast';
import { DemandforecastForm } from '@/features/demandforecast/components/demandforecast-form';
import { useNewDemandforecast } from '@/features/demandforecast/hooks/use-new-demandforecast';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';

const demandforecastSchema = z.object({
  facilityId: z.number().int().positive(),
  productId: z.number().int().positive(),
  type: z.string(),
  parameters: z.number(),
  timePeriodId: z.number().int().positive()
});

type FormValues = z.infer<typeof demandforecastSchema>;

export const NewDemandforecastSheet = () => {
  const { isOpen, onClose } = useNewDemandforecast();
  const createMutation = useCreateDemandforecast();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  // Replace with actual mutation
  const facilitieMutation = { isPending: false }; // Replace with actual mutation
  const productMutation = { isPending: false }; // Replace with actual mutation
  const timePeriodMutation = { isPending: false }; // Replace with actual mutation

  const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
    label: facilitie.name,
    value: facilitie.id
  }));
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));
  const timePeriodOptions = (timePeriodQuery.data ?? []).map((timePeriod) => ({
    label: timePeriod.name,
    value: timePeriod.id
  }));

  const isPending =
    createMutation.isPending ||
    facilitieMutation.isPending ||
    productMutation.isPending ||
    timePeriodMutation.isPending;
  const isLoading =
    facilitieQuery.isLoading ||
    productQuery.isLoading ||
    timePeriodQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      ...values,
      parameters: values.parameters,
      facilityName: '',
      productName: '',
      timePeriodName: ''
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
          <SheetTitle>New Demand Forecast</SheetTitle>
          <SheetDescription>Add a new Demand Forecast</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <DemandforecastForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilitieOptions={facilitieOptions}
            productOptions={productOptions}
            timePeriodOptions={timePeriodOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
