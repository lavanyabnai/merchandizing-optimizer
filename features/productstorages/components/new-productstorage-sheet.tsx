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
import { useCreateProductstorage } from '@/features/productstorages/api/use-create-productstorage';
import { ProductstorageForm } from '@/features/productstorages/components/productstorage-form';
import { useNewProductstorage } from '@/features/productstorages/hooks/use-new-productstorage';
// import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';

// Assuming you have a schema for productstorage, replace this with the actual schema

const productstorageSchema = z.object({
  label: z.string().optional(),
  facilityId: z.number().int().positive(),
  facilityName: z.string().optional(),
  productId: z.number().int().positive(),
  productName: z.string().optional(),
  expandProducts: z.boolean(),
  currency: z.string(),
  timePeriodId: z.number().int().positive(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']),
  minStock: z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val) : undefined)),
  // initialStock: z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // safetyStock: z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // maxStock: z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // fixed: z.boolean().optional(),
  // fixedValue: z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // understockPenalty:  z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // safetyStockPenalty:  z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
  // overstockPenalty:  z
  // .string()
  // .optional()
  // .transform((val) => (val ? parseInt(val) : undefined)),
 
  // productUnit: z.string(),
  
  // expandPeriods: z.boolean().optional(),

});

type FormValues = z.infer<typeof productstorageSchema>;

type ProductStoragePayload = {
  label: string;
  facilityId: number;
  facilityName: string;
  productId: number;
  productName: string;
  timePeriodId: number;
  timePeriodName: string;
  minStock: string | null;
  expandProducts: boolean;
  currency: string;
  inclusionType: 'Include' | 'Exclude' | 'Consider';
};

export const NewProductstorageSheet = () => {
  const { isOpen, onClose } = useNewProductstorage();
  const createMutation = useCreateProductstorage();

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
      const payload: ProductStoragePayload = {
        facilityName: facilitieOptions.find(f => f.value === values.facilityId)?.label ?? '',
        productName: productOptions.find(p => p.value === values.productId)?.label ?? '',
        timePeriodName: timePeriodOptions.find(p => p.value === values.timePeriodId)?.label ?? '',
        ...values,
        label: values.label || "",
        facilityId: values.facilityId || 0,
        productId: values.productId || 0,
        timePeriodId: values.timePeriodId || 0,
        minStock: values.minStock?.toString() ?? null,
        expandProducts: values.expandProducts || false,
        currency: values.currency || '',
        inclusionType: values.inclusionType || 'Include'
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
          <SheetTitle>New Productstorage</SheetTitle>
          <SheetDescription>Add a new productstorage</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <ProductstorageForm
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
