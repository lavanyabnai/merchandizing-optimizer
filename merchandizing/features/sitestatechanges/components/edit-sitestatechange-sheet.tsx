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
import { useDeleteSitestatechange } from '@/features/sitestatechanges/api/use-delete-sitestatechange';
import { useEditSitestatechange } from '@/features/sitestatechanges/api/use-edit-sitestatechange';
import { useGetSitestatechange } from '@/features/sitestatechanges/api/use-get-sitestatechange';
import { useOpenSitestatechange } from '@/features/sitestatechanges/hooks/use-open-sitestatechange';
import { SitestatechangeForm } from '@/features/sitestatechanges/components/sitestatechange-form';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useConfirm } from '@/hooks/use-confirm';



const sitestatechangeSchema = z.object({
  siteId: z.number().int().positive(),
  timePeriodId: z.number().int().positive(),
  newSiteState: z.string(),
});
type FormValues = z.infer<typeof sitestatechangeSchema>;

export const EditSitestatechangeSheet = () => {
  const { isOpen, onClose, id } = useOpenSitestatechange();
  const facilitiesQuery = useGetFacilities();
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this sitestatechange.'
  );

  const sitestatechangeQuery = useGetSitestatechange(id);
  const editMutation = useEditSitestatechange(id);
  const deleteMutation = useDeleteSitestatechange(id);

  // const locationQuery = useGetLocations();
  // const locationOptions = (locationQuery.data ?? []).map((location) => ({
  //   label: location.name,
  //   value: location.id
  // }));

  const facilitiesOptions = (facilitiesQuery.data ?? []).map((facilities) => ({
    label: facilities.name,
    value: facilities.id
  }));

  // const productQuery = useGetProducts();
  // const productOptions = (productQuery.data ?? []).map((product) => ({
  //   label: product.name,
  //   value: product.id
  // }));

  const periodsQuery = useGetPeriods();
  const periodsOptions = (periodsQuery.data ?? []).map((period) => ({
    label: period.name,
    value: period.id
  }));

  const isPending =
    editMutation.isPending || deleteMutation.isPending || sitestatechangeQuery.isLoading;

  const isLoading =
    sitestatechangeQuery.isLoading ||
    facilitiesQuery.isLoading ||
    // productQuery.isLoading ||
    periodsQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    console.log('edit sitestatechange form', values);
    editMutation.mutate({
      newSiteState: values.newSiteState
    }, {
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

  const defaultValues = sitestatechangeQuery.data
    ? {
      siteId: sitestatechangeQuery.data.siteId,
      timePeriodId: sitestatechangeQuery.data.timePeriodId,
        newSiteState: sitestatechangeQuery.data.newSiteState
      }
    : {
        siteId: 0,
        timePeriodId: 0,
        newSiteState: ''
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 bg-white">
          <SheetHeader>
            <SheetTitle>Edit Sitestatechange</SheetTitle>
            <SheetDescription>Edit an existing sitestatechange</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <SitestatechangeForm
              id={Number(id) || undefined}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              // locationOptions={locationOptions}
              facilitiesOptions={facilitiesOptions}
              // productOptions={productOptions}
              periodsOptions={periodsOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </> 
  );
};
