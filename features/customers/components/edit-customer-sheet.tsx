import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useDeleteCustomer } from '@/features/customers/api/use-delete-customer';
import { useEditCustomer } from '@/features/customers/api/use-edit-customer';
import { useGetCustomer } from '@/features/customers/api/use-get-customer';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { useOpenCustomer } from '@/features/customers/hooks/use-open-customer';
import { useGetLocations } from '@/features/locations/api/use-get-locations';

import { useConfirm } from '@/hooks/use-confirm';
// Import the actual customer schema from your schema file


// Use the actual customer schema, omitting the id field for editing
// const formSchema = customerSchema.omit({ id: true });
const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  locationId: z.number(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']),
  additionalParams: z.record(z.unknown()).optional(),
  icon: z.string().optional()
});

type FormValues = z.infer<typeof customerSchema>;

export const EditCustomerSheet = () => {
  const { isOpen, onClose, id } = useOpenCustomer();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this customer.'
  );

  const customerQuery = useGetCustomer(id);
  const editMutation = useEditCustomer(id);
  const deleteMutation = useDeleteCustomer(id);

  const locationQuery = useGetLocations();
  const locationOptions = (locationQuery.data ?? []).map((location) => ({
    label: location.name,
    value: location.id
  }));

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    customerQuery.isLoading;

  const isLoading = customerQuery.isLoading || locationQuery.isLoading;

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

  const defaultValues = customerQuery.data
    ? {
        name: customerQuery.data.name,
        type: customerQuery.data.type ?? undefined,
        locationId: customerQuery.data.locationId,
        inclusionType: customerQuery.data.inclusionType as
          | 'Include'
          | 'Exclude'
          | 'Consider',
        additionalParams: customerQuery.data.additionalParams ?? {},
        icon: customerQuery.data.icon ?? undefined
      }
    : {
        name: '',
        type: undefined,
        locationId: 0,
        inclusionType: 'Consider' as const,
        additionalParams: {},
        icon: undefined
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Customer</SheetTitle>
            <SheetDescription>Edit an existing customer</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <CustomerForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              locationOptions={locationOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
