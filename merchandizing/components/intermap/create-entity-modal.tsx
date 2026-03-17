"use client"
import { Loader2 } from "lucide-react"
import { z } from "zod"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetOverlay } from "@/components/ui/sheet"
import { useCreateCustomer } from "@/features/customers/api/use-create-customer"
import { CustomerForm } from "./customer-form"
import { useGetLocations } from "@/features/locations/api/use-get-locations"
import { useNewCustomer } from "@/features/customers/hooks/use-new-customer"
// import type { EntityType } from "@/components/intermap/map-entities"

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().optional(),
  locationId: z.number(),
  inclusionType: z.enum(["Include", "Exclude", "Consider"]),
  additionalParams: z.record(z.unknown()).optional(),
  icon: z.string().optional(),
})

type FormValues = z.infer<typeof customerSchema>

export const NewCustomerSheet = () => {
  const { isOpen, onClose } = useNewCustomer()
  const { data: locations, isLoading: locationsLoading } = useGetLocations()
  const createCustomer = useCreateCustomer()

  // const getEntityTypeLabel = (type: EntityType): string => {
  //   switch (type) {
  //     case "customer":
  //       return "Customer"
  //     case "distribution":
  //       return "Distribution Center"
  //     case "factory":
  //       return "Factory"
  //     case "supplier":
  //       return "Supplier"
  //     default:
  //       return "Entity"
  //   }
  // }

  // Filter locations that have valid coordinates
  const locationsWithCoordinates =
    locations?.filter(
      (location: any) =>
        location.latitude &&
        location.longitude &&
        typeof location.latitude === "number" &&
        typeof location.longitude === "number" &&
        !isNaN(location.latitude) &&
        !isNaN(location.longitude),
    ) || []

  const locationOptions = locationsWithCoordinates.map((location: any) => ({
    label: `${location.name} - ${location.city || "Unknown"}, ${location.country || "Unknown"}`,
    value: location.id,
  }))

  // Default to first location if available
  const defaultLocationId = locationOptions.length > 0 ? locationOptions[0].value : 0

  const isPending = createCustomer.isPending
  const isLoading = locationsLoading

  const onSubmit = (values: FormValues) => {
    createCustomer.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetOverlay className="bg-black/10" />
      <SheetContent className="space-y-4 bg-white w-96 z-[60] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Customer</SheetTitle>
                     <SheetDescription>
             Add a new customer to your supply chain
           </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
                     <CustomerForm
             onSubmit={onSubmit}
             disabled={isPending}
             locationOptions={locationOptions}
             defaultValues={{
               name: "",
               type: "retail",
               locationId: defaultLocationId,
               inclusionType: "Include",
               additionalParams: {},
               icon: "👤",
             }}
           />
        )}
      </SheetContent>
    </Sheet>
  )
}
