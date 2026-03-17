import { JSX, useRef, useState } from "react";


import { Select } from "@/components/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useCreateLocation } from "@/features/locations/api/use-create-location";
import { useGetLocations } from "@/features/locations/api/use-get-locations";

export const useSelectLocation = (): [() => JSX.Element, () => Promise<unknown>] => {
  const locationQuery = useGetLocations();
  const locationMutation = useCreateLocation();
  const onCreateLocation = (name: string) => locationMutation.mutate({
    name,
    country: ""
  });
  const locationOptions = (locationQuery.data ?? []).map((location: { name: any; id: any; }) => ({
    label: location.name,
    value: location.id,
  }));

  const [promise, setPromise] = useState<{ 
    resolve: (value: string | undefined) => void 
  } | null>(null);
  const selectValue = useRef<string>(undefined);

  const confirm = () => new Promise((resolve) => {
    setPromise({ resolve });
  });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(selectValue.current);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(undefined);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Select Location
          </DialogTitle>
          <DialogDescription>
            Please select an location to continue.
          </DialogDescription>
        </DialogHeader>
        <Select
          placeholder="Select an location"
          options={locationOptions}
          onCreate={onCreateLocation}
          onChange={(value) => selectValue.current = value ?? ''}
          disabled={locationQuery.isLoading || locationMutation.isPending}
        />
        <DialogFooter className="pt-2">
          <Button
            onClick={handleCancel}
            variant="outline"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
