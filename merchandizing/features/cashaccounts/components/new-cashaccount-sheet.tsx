import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCreateCashaccount } from '@/features/cashaccounts/api/use-create-cashaccount';
import { CashaccountForm } from '@/features/cashaccounts/components/cashaccount-form';
import { useNewCashaccount } from '@/features/cashaccounts/hooks/use-new-cashaccount';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';

// Update the schema to match the types
const cashaccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  facilityId: z.number().int().positive('Facility is required'),
  initialCash: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  interest: z.string().optional()
});

type FormValues = z.infer<typeof cashaccountSchema>;

export const NewCashaccountSheet = () => {
  const { isOpen, onClose } = useNewCashaccount();
  const createMutation = useCreateCashaccount();

  // Placeholder for useLocation hook
  const facilityQuery = useGetFacilities();
  // const facilityMutation = { isPending: false }; // Replace with actual mutation
  // const onCreateLocation = (name: string) => {
  //   // Implement location creation logic
  // };
  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));

  const isPending = createMutation.isPending;
  const isLoading = facilityQuery.isLoading;
 const onSubmit = (values: FormValues) => {
   const selectedFacility = facilityQuery.data?.find(f => f.id === values.facilityId);
   const formattedValues = {
     ...values,
     facilityName: selectedFacility?.name ?? ''
   };
   createMutation.mutate(formattedValues, {
     onSuccess: () => {
       onClose();
     }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 bg-white">
        <SheetHeader>
          <SheetTitle>New Cashaccount</SheetTitle>
          <SheetDescription>Add a new cashaccount</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <CashaccountForm
            onSubmit={(values) => {
              onSubmit({
                ...values,
                initialCash: values.initialCash?.toString() || undefined,
                interest: values.interest?.toString() || undefined
              });
            }}
            disabled={isPending}
            facilityOptions={facilityOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
