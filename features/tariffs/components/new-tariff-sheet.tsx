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
import { useCreateTariff } from '@/features/tariffs/api/use-create-tariff';
import { TariffForm } from '@/features/tariffs/components/tariff-form';
import { useNewTariff } from '@/features/tariffs/hooks/use-new-tariff';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';

// Assuming you have a schema for tariff, replace this with the actual schema

const tariffSchema = z.object({
  fromId: z.number().int().positive(),
  toId: z.number().int().positive(),
  productId: z.number().int().positive(),
  fixed: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  adValorem: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  timePeriodId: z.number().int().positive(),
  currency: z.string().optional(),
  inclusionType: z.string().optional(),
  productUnit: z.string().optional(),
  tariffType: z.string().optional()
});

type FormValues = z.infer<typeof tariffSchema>;

export const NewTariffSheet = () => {
  const { isOpen, onClose } = useNewTariff();
  const createMutation = useCreateTariff();

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
    console.log(`Form values: ${JSON.stringify(values)}`);

    // const selectedFacilitie = facilitieOptions.find(f => f.value === values.fromId);
    // const selectedProduct = productOptions.find(p => p.value === values.productId);
    // const selectedTimePeriod = timePeriodOptions.find(tp => tp.value === values.timePeriodId);



    createMutation.mutate({
      ...values,
      fixed: values.fixed?.toString() ?? '',
      adValorem: values.adValorem?.toString() ?? '',
      currency: values.currency ?? '',
      inclusionType: values.inclusionType ?? '',
      productUnit: values.productUnit ?? '',
      tariffType: values.tariffType ?? '',
      productName: '',
      timePeriodName: '',
      fromName: '',
      toName: ''
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
          <SheetTitle>New Tariff</SheetTitle>
          <SheetDescription>Add a New Tariff</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <TariffForm
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
