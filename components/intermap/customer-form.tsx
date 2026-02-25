"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Trash, Plus, MapPin } from "lucide-react"
import { useNewLocation } from "@/features/locations/hooks/use-new-location"

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().optional(),
  locationId: z.number(),
  inclusionType: z.enum(["Include", "Exclude", "Consider"]),
  additionalParams: z.record(z.unknown()).optional(),
  icon: z.string().optional(),
})

type FormValues = z.infer<typeof customerSchema>

type Props = {
  id?: string
  defaultValues?: FormValues
  onSubmit: (values: FormValues) => void
  onDelete?: () => void
  disabled?: boolean
  locationOptions: { label: string; value: number }[]
  clickPosition?: { lat: number; lng: number }
}

export const CustomerForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  locationOptions,
  clickPosition,
}: Props) => {
  const { onOpen: openLocationForm } = useNewLocation()

  const form = useForm<FormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues || {
      name: "",
      type: "retail",
      locationId: 0,
      inclusionType: "Include",
      additionalParams: {},
      icon: "👤",
    },
  })

  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
  }

  const handleDelete = () => {
    onDelete?.()
  }

  const handleCreateNewLocation = () => {
    if (clickPosition) {
      openLocationForm()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="Customer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select disabled={disabled} onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <div className="space-y-2">
                <Select
                  disabled={disabled}
                  onValueChange={(value) => field.onChange(Number.parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {clickPosition && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNewLocation}
                    disabled={disabled}
                    className="w-full flex items-center gap-2 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                    <MapPin className="h-4 w-4" />
                    Create New Location Here
                    <span className="text-xs text-muted-foreground ml-auto">
                      ({clickPosition.lat.toFixed(4)}, {clickPosition.lng.toFixed(4)})
                    </span>
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inclusionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inclusion Type</FormLabel>
              <Select disabled={disabled} onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inclusion type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Include">Include</SelectItem>
                  <SelectItem value="Exclude">Exclude</SelectItem>
                  <SelectItem value="Consider">Consider</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (optional)</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="👤" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create customer"}
        </Button>

        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full bg-transparent"
            variant="outline"
          >
            <Trash className="size-4 mr-2" />
            Delete customer
          </Button>
        )}
      </form>
    </Form>
  )
}
