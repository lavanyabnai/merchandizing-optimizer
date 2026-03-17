import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteProductstorage } from '@/features/productstorages/api/use-delete-productstorage';
import { useEditProductstorage } from '@/features/productstorages/api/use-edit-productstorage';
import { useGetProductstorage } from '@/features/productstorages/api/use-get-productstorage';
import { ProductstorageForm } from '@/features/productstorages/components/productstorage-form';
import { useOpenProductstorage } from '@/features/productstorages/hooks/use-open-productstorage';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useConfirm } from '@/hooks/use-confirm';
// Import the actual productstorage schema from your schema file


const productstorageSchema = z.object({
  label: z.string().optional(),
  facilityId: z.number().int().positive(), 
  facilityName: z.string().optional(),
  expandFacilities: z.boolean().optional(),
  productId: z.number().int().positive(),
  productName: z.string().optional(),
  expandProducts: z.boolean().optional(),
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

export const EditProductstorageSheet = () => {
  const { isOpen, onClose, id } = useOpenProductstorage();
  const facilitieQuery = useGetFacilities();
  const productQuery = useGetProducts();
  const timePeriodQuery = useGetPeriods();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this productstorage.'
  );

  const productstorageQuery = useGetProductstorage(id);
  const editMutation = useEditProductstorage(id);
  const deleteMutation = useDeleteProductstorage(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    productstorageQuery.isLoading;

  const isLoading =
    productstorageQuery.isLoading ||
    !productstorageQuery.data;

 

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

  const onSubmit = (values: FormValues) => {
    console.log('edit productstorage form', values);
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  const defaultValues = productstorageQuery.data
    ? {
      label: productstorageQuery.data.label,
        facilityId: productstorageQuery.data.facilityId,
        expandFacilities: productstorageQuery.data.expandFacilities,
        productId: productstorageQuery.data.productId,
        expandProducts: productstorageQuery.data.expandProducts,
        initialStock: productstorageQuery.data.initialStock,
        minStock: productstorageQuery.data.minStock,
        safetyStock: productstorageQuery.data.safetyStock,
        maxStock: productstorageQuery.data.maxStock,
        fixed: productstorageQuery.data.fixed,
        fixedValue: productstorageQuery.data.fixedValue,
        understockPenalty: productstorageQuery.data.understockPenalty,
        safetyStockPenalty: productstorageQuery.data.safetyStockPenalty,
        overstockPenalty: productstorageQuery.data.overstockPenalty,
        currency: productstorageQuery.data.currency,
        productUnit: productstorageQuery.data.productUnit,
        timePeriodId: productstorageQuery.data.timePeriodId,
        expandPeriods: productstorageQuery.data.expandPeriods,
        inclusionType: productstorageQuery.data.inclusionType
      }
    : {
        label: '',
        facilityId: 0,
        facilityName: '',
        expandFacilities: false,
        productId: 0,
        productName: '',
        expandProducts: false,
        initialStock: '',
        minStock: '',
        safetyStock: '',
        maxStock: '',
        fixed: false,
        fixedValue: '',
        understockPenalty: '',
        safetyStockPenalty: '',
        overstockPenalty: '',
        currency: '',
        productUnit: '',
        timePeriodId: 0,
        expandPeriods: false,
        inclusionType: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Productstorage</SheetTitle>
            <SheetDescription>Edit an existing productstorage</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <ProductstorageForm
              id={Number(id) || undefined}
              defaultValues={{
                facilityId: defaultValues.facilityId,
                productId: defaultValues.productId,
                inclusionType: (defaultValues.inclusionType as "Include" | "Exclude" | "Consider") || undefined,
                timePeriodId: defaultValues.timePeriodId || 0,
                currency: defaultValues.currency || undefined
              }}
              onSubmit={(values) => {
                onSubmit({
                  ...values,
                  inclusionType: values.inclusionType as "Include" | "Exclude" | "Consider"
                });
              }}
              onDelete={onDelete}
              disabled={isPending}
              facilitieOptions={facilitieOptions}
              productOptions={productOptions}
              timePeriodOptions={timePeriodOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}