import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteCashaccount } from '@/features/cashaccounts/api/use-delete-cashaccount';
import { useEditCashaccount } from '@/features/cashaccounts/api/use-edit-cashaccount';
import { useGetCashaccount } from '@/features/cashaccounts/api/use-get-cashaccount';
import { CashaccountForm } from '@/features/cashaccounts/components/cashaccount-form';
import { useOpenCashaccount } from '@/features/cashaccounts/hooks/use-open-cashaccount';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';

import { useConfirm } from '@/hooks/use-confirm';

// Define the cashaccount schema
const cashaccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  facilityId: z.number().int().positive('End product is required'),
  initialCash: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  currency: z.string().min(1, 'Currency is required'),
  interest: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
});

type FormValues = z.infer<typeof cashaccountSchema>;

export const EditCashaccountSheet = () => {
  const { isOpen, onClose, id } = useOpenCashaccount();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this cashaccount.'
  );

  const cashaccountQuery = useGetCashaccount(id);
  const editMutation = useEditCashaccount(id);
  const deleteMutation = useDeleteCashaccount(id);

  const facilityQuery = useGetFacilities();
  const facilityOptions = (facilityQuery.data ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id
  }));

  const isPending =
    editMutation.isPending || deleteMutation.isPending || cashaccountQuery.isLoading;

  const isLoading = cashaccountQuery.isLoading || facilityQuery.isLoading;

  const onSubmit = (values: FormValues) => {
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

  const defaultValues = cashaccountQuery.data
    ? {
        name: cashaccountQuery.data.name,
        facilityId: cashaccountQuery.data.facilityId,
        initialCash: cashaccountQuery.data.initialCash ? Number(cashaccountQuery.data.initialCash) : undefined,
        currency: cashaccountQuery.data.currency,
        interest: cashaccountQuery.data.interest ? Number(cashaccountQuery.data.interest) : undefined
      }
    : {
        name: '',
        facilityId: 0,
        initialCash: undefined,
        currency: '',
        interest: undefined
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Cashaccount</SheetTitle>
            <SheetDescription>Edit an existing cashaccount</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <CashaccountForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              facilityOptions={facilityOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
