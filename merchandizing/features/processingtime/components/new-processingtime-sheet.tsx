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
import { useCreateProcessingtime } from '@/features/processingtime/api/use-create-processingtime';
import { ProcessingtimeForm } from '@/features/processingtime/components/processingtime-form';
import { useNewProcessingtime } from '@/features/processingtime/hooks/use-new-processingtime';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';

import { useGetProducts } from '@/features/products/api/use-get-products';

// Assuming you have a schema for processingtime, replace this with the actual schema

const processingtimeSchema = z.object({
  facilityId: z.number().int().positive(),  
  productId: z.number().int().positive(),
  type: z.string(),
  units: z.string(),
  time: z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
  timeUnit: z.string(),

});

type FormValues = z.infer<typeof processingtimeSchema>;

export const NewProcessingtimeSheet = () => {
  const { isOpen, onClose } = useNewProcessingtime();
  const createMutation = useCreateProcessingtime();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  // Replace with actual mutation
  const facilitieMutation = { isPending: false }; // Replace with actual mutation
  const productMutation = { isPending: false }; // Replace with actual mutation

  const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
    label: facilitie.name,
    value: facilitie.id
  }));
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));

  const isPending =
    createMutation.isPending ||
    facilitieMutation.isPending ||
    productMutation.isPending ;

  const isLoading =
    facilitieQuery.isLoading ||
    productQuery.isLoading ;
  

  const onSubmit = (values: FormValues) => {
    console.log(`Form values: ${JSON.stringify(values)}`);
    createMutation.mutate({
      ...values,
      time: values.time?.toString() ?? '',
      facilityName: '',
      productName: ''
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
          <SheetTitle>New Processingtime</SheetTitle>
          <SheetDescription>Add a new processingtime</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <ProcessingtimeForm
            onSubmit={onSubmit}
            disabled={isPending}
            facilitieOptions={facilitieOptions}
            productOptions={productOptions}

          />
        )}
      </SheetContent>
    </Sheet>
  );
};
