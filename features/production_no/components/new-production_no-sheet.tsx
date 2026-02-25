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
import { useCreateProduction_no } from '@/features/production_no/api/use-create-production_no';
import { Production_noForm } from '@/features/production_no/components/production_no-form';
import { useNewProduction_no } from '@/features/production_no/hooks/use-new-production_no';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetProducts } from '@/features/products/api/use-get-products';


// Assuming you have a schema for production_no, replace this with the actual schema

const production_noSchema = z.object({
  label: z.string(),
  siteId: z.number().int().positive(),  
  productId: z.number().int().positive(),
  // bomId: z.number().int().positive(),
  inclusionType: z.string(),
  currency: z.string().optional(),
});

type FormValues = z.infer<typeof production_noSchema>;

export const NewProduction_noSheet = () => {
  const { isOpen, onClose } = useNewProduction_no();
  const createMutation = useCreateProduction_no();

  // Placeholder for useLocation hook
  // const locationQuery = useGetLocations();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  // Replace with actual mutation
  const facilitieMutation = { isPending: false }; // Replace with actual mutation
  const productMutation = { isPending: false }; // Replace with actual mutation
  const bomMutation = { isPending: false }; // Replace with actual mutation

  const facilitieOptions = (facilitieQuery.data ?? []).map((facilitie) => ({
    label: facilitie.name,
    value: facilitie.id
  }));
  const productOptions = (productQuery.data ?? []).map((product) => ({
    label: product.name,
    value: product.id
  }));
  
  // const bomOptions = (bomQuery.data ?? []).map((bom) => ({
  //   label: bom.name,
  //   value: bom.id
  // }));

  const isPending =
    createMutation.isPending ||
    facilitieMutation.isPending ||
    productMutation.isPending || 
    bomMutation.isPending ;

  const isLoading =
    facilitieQuery.isLoading ||
    productQuery.isLoading ;
    // bomQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    // Find the selected site and product objects to get their names
    const selectedSite = facilitieOptions.find(option => option.value === values.siteId);
    const selectedProduct = productOptions.find(option => option.value === values.productId);

    // Fallback to empty string if not found
    const siteName = selectedSite ? selectedSite.label : '';
    const productName = selectedProduct ? selectedProduct.label : '';
    // timePeriodName is required but not present in the form, so set as empty string or handle as needed
    const timePeriodName = '';

    const payload = {
      ...values,
      siteName,
      productName,
      timePeriodName,
    };

    console.log(`Form values: ${JSON.stringify(payload)}`);
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
          <SheetTitle>New Production_no</SheetTitle>
          <SheetDescription>Add a new production_no</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <Production_noForm
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
