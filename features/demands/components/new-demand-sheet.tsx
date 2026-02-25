import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useGetCustomers } from '@/features/customers/api/use-get-customers';
import { useCreateDemand } from '@/features/demands/api/use-create-demand';
import { DemandForm } from '@/features/demands/components/demand-form';
import { useNewDemand } from '@/features/demands/hooks/use-new-demand';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';

// Assuming you have a schema for demand, replace this with the actual schema

const demandSchema = z.object({
  customerId: z.number().int().positive(),
  productId: z.number().int().positive(),
  demandType: z.string(),
  parameters: z.record(z.any()),
  timePeriodId: z.number().int().positive(),
  // revenue: z.float().optional(),
  // downPenalty: z.number().optional(),
  // upPenalty: z.number().optional(),
  currency: z.string().optional(),
  // expectedLeadTime: z.number().optional(),
  // timeUnit: z.string().optional(),
  // minSplitRatio: z.number().optional(),
  // backorderPolicy: z.string().optional(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider'])
  // additionalParams: z.record(z.unknown()).optional(),
  // icon: z.string().optional()
});

type FormValues = z.infer<typeof demandSchema>;

export const NewDemandSheet = () => {
  const { isOpen, onClose } = useNewDemand();
  const createMutation = useCreateDemand();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const customerQuery = useGetCustomers();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();
  // Replace with actual mutation
  const customerMutation = { isPending: false }; // Replace with actual mutation
  const productMutation = { isPending: false }; // Replace with actual mutation
  const timePeriodMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateLocation = (name: string) => {
  //   // Implement location creation logic
  // };
  // const locationOptions = (locationQuery.data ?? []).map((location) => ({
  //   label: location.name,
  //   value: location.id
  // }));
  const customerOptions = (customerQuery.data ?? []).map((customer) => ({
    label: customer.name,
    value: customer.id
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
    customerMutation.isPending ||
    productMutation.isPending ||
    timePeriodMutation.isPending;
  const isLoading =
    customerQuery.isLoading ||
    productQuery.isLoading ||
    timePeriodQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    console.log(`Form values: ${JSON.stringify(values)}`);
    createMutation.mutate({
      ...values,
      parameters: (values.parameters as { value: number; }).value,
      customerName: '',
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
          <SheetTitle>New Demand</SheetTitle>
          <SheetDescription>Add a new demand</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <DemandForm
            onSubmit={onSubmit}
            disabled={isPending}
            customerOptions={customerOptions}
            productOptions={productOptions}
            timePeriodOptions={timePeriodOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
