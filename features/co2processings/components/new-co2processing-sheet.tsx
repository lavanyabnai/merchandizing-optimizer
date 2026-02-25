import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateCo2processing } from '@/features/co2processings/api/use-create-co2processing';
import { Co2processingForm } from '@/features/co2processings/components/co2processing-form';
import { useNewCo2processing } from '@/features/co2processings/hooks/use-new-co2processing';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';


// Assuming you have a schema for co2processing, replace this with the actual schema
const co2processingSchema = z.object({
  facilityId: z.number(),
  productId: z.number(),
  processingType: z.string(),
  units: z.string(),
  co2Produced: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  timePeriodId: z.number(),
  co2CalculationFormula: z.string().optional()
});

type FormValues = z.infer<typeof co2processingSchema>;

export const NewCo2processingSheet = () => {
  const { isOpen, onClose } = useNewCo2processing();
  const createMutation = useCreateCo2processing();

  // Placeholder for useLocation hook
  const facilityQuery = useGetFacilities();
  const periodQuery = useGetPeriods();
  const locationMutation = { isPending: false }; // Replace with actual mutation

  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));
  const periodOptions = (periodQuery.data ?? []).map((period) => ({
    label: period.name,
    value: period.id
  }));
 const productQuery = useGetProducts();
 const productOptions = (productQuery.data ?? []).map((product) => ({
   label: product.name,
   value: product.id
 }));
  const isPending = createMutation.isPending || locationMutation.isPending;
  const isLoading = facilityQuery.isLoading || periodQuery.isLoading;
  const onSubmit = (values: FormValues) => {
    const transformedValues = {
      ...values,
      co2Produced: values.co2Produced?.toString() ?? "0",
      // Add missing fields for the mutation payload
      facilityName: facilityOptions.find(f => f.value === values.facilityId)?.label ?? "",
      productName: productOptions.find(p => p.value === values.productId)?.label ?? "",
      timePeriodName: periodOptions.find(p => p.value === values.timePeriodId)?.label ?? ""
    } as const;
    createMutation.mutate(transformedValues as {
      facilityName: string;
      productId: number;
      productName: string;
      timePeriodId: number;
      timePeriodName: string;
      units: string;
      facilityId: number;
      co2Produced: string;
      processingType: string;
      co2CalculationFormula?: string | null | undefined;
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
          <SheetTitle>New Co2processing</SheetTitle>
          <SheetDescription>Add a new co2processing</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <Co2processingForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilityOptions={facilityOptions}
            periodOptions={periodOptions}
            productOptions={productOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
