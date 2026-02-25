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
import { useCreateProcessingcost } from '@/features/processingcost/api/use-create-processingcost';
import { ProcessingcostForm } from '@/features/processingcost/components/processingcost-form';
import { useNewProcessingcost } from '@/features/processingcost/hooks/use-new-processingcost';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';

// Assuming you have a schema for processingcost, replace this with the actual schema

const processingcostSchema = z.object({
  facilityId: z.number().int().positive(),  
  productId: z.number().int().positive(),
  type: z.string(),
  units: z.string(),
  cost: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  currency: z.string().optional(),
  timePeriodId: z.number().int().positive(),
});

type FormValues = z.infer<typeof processingcostSchema>;

export const NewProcessingcostSheet = () => {
  const { isOpen, onClose } = useNewProcessingcost();
  const createMutation = useCreateProcessingcost();

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
      cost: values.cost?.toString() ?? '',
      currency: values.currency ?? 'USD' // Provide default currency
      ,
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
          <SheetTitle>New Processingcost</SheetTitle>
          <SheetDescription>Add a new processingcost</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <ProcessingcostForm
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
