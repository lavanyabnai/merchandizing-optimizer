"use client"

import { Loader2, MapPin } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetOverlay } from "@/components/ui/sheet"
import { useCreateLocation } from "./use-create-location"
import { LocationForm } from "./location-form"
import { useNewLocation } from "@/features/locations/hooks/use-new-location"

export const NewLocationSheet = () => {
  const { isOpen, onClose } = useNewLocation()
  const createLocation = useCreateLocation()

  const onSubmit = (values: any) => {
    createLocation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetOverlay className="bg-black/10" />
      <SheetContent className="space-y-4 bg-white w-96 z-[70] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <SheetTitle>New Location</SheetTitle>
          </div>
          <SheetDescription>Create a new location at the clicked position</SheetDescription>
        </SheetHeader>
        {createLocation.isPending ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <LocationForm
            onSubmit={onSubmit}
            onCancel={onClose}
            disabled={createLocation.isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
