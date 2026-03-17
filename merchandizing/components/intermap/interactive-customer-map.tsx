"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Users, MapPin, Plus, Search, X, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useGetCustomers } from "@/features/customers/api/use-get-customers"
import { useGetLocations } from "@/features/locations/api/use-get-locations"
import { useCreateCustomer } from "@/features/customers/api/use-create-customer"
import { useEditCustomer } from "@/features/customers/api/use-edit-customer"
import { useDeleteCustomer } from "@/features/customers/api/use-delete-customer"

// FontAwesome icon mapping
const ICON_CLASS_MAP: Record<string, string> = {
  FaUser: 'fa-user',
  FaStore: 'fa-store',
  FaBuilding: 'fa-building',
  FaIndustry: 'fa-industry',
  FaUserTie: 'fa-user-tie',
  FaShoppingCart: 'fa-shopping-cart',
  FaTruck: 'fa-truck',
  FaWarehouse: 'fa-warehouse',
  FaHome: 'fa-home',
  FaGraduationCap: 'fa-graduation-cap',
  FaHospital: 'fa-hospital',
  FaBank: 'fa-building-columns',
}

// Icon options for the select dropdown
const ICON_OPTIONS = [
  { value: 'FaUser', label: 'User', description: 'Individual customer' },
  { value: 'FaStore', label: 'Store', description: 'Retail store' },
  { value: 'FaBuilding', label: 'Building', description: 'Office building' },
  { value: 'FaIndustry', label: 'Industry', description: 'Industrial facility' },
  { value: 'FaUserTie', label: 'Business User', description: 'Business customer' },
  { value: 'FaShoppingCart', label: 'Shopping', description: 'E-commerce customer' },
  { value: 'FaTruck', label: 'Logistics', description: 'Transportation company' },
  { value: 'FaWarehouse', label: 'Warehouse', description: 'Storage facility' },
  { value: 'FaHome', label: 'Home', description: 'Residential customer' },
  { value: 'FaGraduationCap', label: 'Education', description: 'Educational institution' },
  { value: 'FaHospital', label: 'Healthcare', description: 'Medical facility' },
  { value: 'FaBank', label: 'Financial', description: 'Bank or financial institution' },
]

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

// Create custom icons for different entity types
const createCustomIcon = (
  _type: string,
  entityType: "customer" | "distribution" | "factory" | "supplier" = "customer",
  isSelected = false,
  icon?: string,
) => {
  let iconColor = ""

  // Set icon and color based on entity type
  switch (entityType) {
    case "customer":
      iconColor = "#3b82f6"
      icon = "FaUser"
       // blue-500
      break
    case "distribution":
      iconColor = "#8b5cf6" // purple-500
      icon = "FaStore"
      break
    case "factory":
      iconColor = "#ef4444" // red-500
      icon = "FaBuilding"
      break
    case "supplier":
      iconColor = "#f97316" // orange-500
      icon = "FaIndustry"
      break
  }

  const size = isSelected ? 40 : 32
  const highlightColor = isSelected ? "#fbbf24" : iconColor

  // Use FontAwesome icon if provided and mapped, otherwise use emoji or default SVG
  let iconContent = ""
  if (icon && ICON_CLASS_MAP[icon]) {
    iconContent = `<i class="fas ${ICON_CLASS_MAP[icon]}" style="font-size: ${isSelected ? "18px" : "14px"}; color: white;"></i>`
  } else if (icon && !ICON_CLASS_MAP[icon]) {
    // Fallback to emoji if it's not in the icon map
    iconContent = `<span style="font-size: ${isSelected ? "20px" : "16px"};">${icon}</span>`
  } else {
    // Default SVG
    iconContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 20 : 16}" height="${isSelected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.8-7.8 5.5 5.5 0 0 0 7.8 7.8Z"/>
    </svg>`
  }

  const iconHtml = `
    <div style="background-color: ${highlightColor}; border: 2px solid white; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
      ${iconContent}
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Component to handle map clicks for creating new customers
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Customer form component (for both create and edit)
function CustomerForm({
  customer,
  lat,
  lng,
  onClose,
  onSubmit,
  isEditing = false,
}: {
  customer?: any
  lat?: number
  lng?: number
  onClose: () => void
  onSubmit: (data: any) => void
  isEditing?: boolean
}) {
  const { data: locations = [] } = useGetLocations()
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    type: customer?.type || "retail",
    locationId: customer?.locationId?.toString() || "",
    inclusionType: customer?.inclusionType || "Include",
    icon: customer?.icon || "FaUser",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.locationId) return

    const submitData = {
      ...formData,
      locationId: Number.parseInt(formData.locationId),
      additionalParams: isEditing ? customer?.additionalParams : { clickedLat: lat, clickedLng: lng },
    }

    onSubmit(submitData)
  }

  const selectedIconOption = ICON_OPTIONS.find(opt => opt.value === formData.icon)

  return (
    <Card className="w-96 max-h-[80vh] overflow-y-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isEditing ? "Edit Customer" : "Add New Customer"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {!isEditing && lat && lng && (
          <p className="text-sm text-muted-foreground">
            Clicked at: {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Customer Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Select
              value={formData.locationId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, locationId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location: any) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name} - {location.city}, {location.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="inclusion">Inclusion Type</Label>
            <Select
              value={formData.inclusionType}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, inclusionType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Include">Include</SelectItem>
                <SelectItem value="Exclude">Exclude</SelectItem>
                <SelectItem value="Consider">Consider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}
            >
              <SelectTrigger>
                <SelectValue>
                  {selectedIconOption && (
                    <div className="flex items-center gap-2">
                      <i className={`fas ${ICON_CLASS_MAP[selectedIconOption.value]}`} />
                      {selectedIconOption.label}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <i className={`fas ${ICON_CLASS_MAP[option.value]}`} />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEditing ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Customer
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface InteractiveCustomerMapProps {
  className?: string
}

export default function InteractiveCustomerMap({ className }: InteractiveCustomerMapProps) {
  const { data: customers = [], isLoading: customersLoading } = useGetCustomers()
  const { data: locations = [], isLoading: locationsLoading } = useGetLocations()
  const createCustomer = useCreateCustomer()

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newCustomerLocation, setNewCustomerLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<any>(null)
  const [isCreatingMode, setIsCreatingMode] = useState(false)

  const editCustomer = useEditCustomer(editingCustomer?.id?.toString())
  const deleteCustomer = useDeleteCustomer(deletingCustomer?.id?.toString())

  // Create a map of location IDs to location data for easy lookup
  const locationMap = useMemo(() => {
    const map = new Map()
    locations.forEach((location: any) => {
      map.set(location.id, location)
    })
    return map
  }, [locations])

  // Filter customers based on search and combine with location data
  const customersWithLocations = useMemo(() => {
    return customers
      .map((customer: any) => {
        const location = locationMap.get(customer.locationId)
        return location ? { ...customer, location } : null
      })
      .filter(Boolean)
      .filter((customer: any) => {
        if (!searchQuery) return true
        return (
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.location?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.location?.city.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
  }, [customers, locationMap, searchQuery])

  // Calculate map center based on customer locations
  const mapCenter = useMemo((): [number, number] => {
    if (customersWithLocations.length === 0) {
      return [40.7128, -74.006] // Default to NYC
    }

    const validLocations = customersWithLocations.filter((c: any) => c.location?.lat && c.location?.lng)
    if (validLocations.length === 0) {
      return [40.7128, -74.006]
    }

    const avgLat = validLocations.reduce((sum: number, c: any) => sum + c.location.lat, 0) / validLocations.length
    const avgLng = validLocations.reduce((sum: number, c: any) => sum + c.location.lng, 0) / validLocations.length

    return [avgLat, avgLng]
  }, [customersWithLocations])

  const handleMapClick = (lat: number, lng: number) => {
    if (isCreatingMode) {
      setNewCustomerLocation({ lat, lng })
    }
  }

  const handleCreateCustomer = (data: any) => {
    createCustomer.mutate(data, {
      onSuccess: () => {
        setNewCustomerLocation(null)
        setIsCreatingMode(false)
      },
    })
  }

  const handleEditCustomer = (data: any) => {
    editCustomer.mutate(data, {
      onSuccess: () => {
        setEditingCustomer(null)
        setSelectedCustomer(null)
      },
    })
  }

  const handleDeleteCustomer = () => {
    deleteCustomer.mutate(undefined, {
      onSuccess: () => {
        setDeletingCustomer(null)
        setSelectedCustomer(null)
      },
    })
  }

  if (customersLoading || locationsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading map data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 rounded-full p-2">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Interactive Customer Map</h1>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary">{customersWithLocations.length} customers</Badge>
            <Badge variant="outline">{locations.length} locations</Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search customers..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant={isCreatingMode ? "default" : "outline"}
            onClick={() => setIsCreatingMode(!isCreatingMode)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isCreatingMode ? "Cancel Adding" : "Add Customer"}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      {isCreatingMode && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <p className="text-blue-800 text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Click anywhere on the map to add a new customer at that location
          </p>
        </div>
      )}

      {/* Selected Customer Detail */}
      {selectedCustomer && (
        <div className="bg-white border-b border-gray-200 p-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedCustomer.icon && <span>{selectedCustomer.icon}</span>}
                    {selectedCustomer.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.location?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingCustomer(selectedCustomer)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingCustomer(selectedCustomer)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Customer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {selectedCustomer.type}
                </div>
                <div>
                  <span className="font-medium">Inclusion:</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedCustomer.inclusionType}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Location:</span> {selectedCustomer.location?.city},{" "}
                  {selectedCustomer.location?.country}
                </div>
                <div>
                  <span className="font-medium">Coordinates:</span> {selectedCustomer.location?.lat.toFixed(4)},{" "}
                  {selectedCustomer.location?.lng.toFixed(4)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          className={isCreatingMode ? "cursor-crosshair" : ""}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {/* Customer Markers */}
          {customersWithLocations.map((customer: any) => {
            if (!customer.location?.lat || !customer.location?.lng) return null

            return (
              <Marker
                key={customer.id}
                position={[customer.location.lat, customer.location.lng]}
                icon={createCustomIcon(customer.icon || "FaUser", "customer", selectedCustomer?.id === customer.id, customer.icon || "FaUser")}
                eventHandlers={{
                  click: () => setSelectedCustomer(customer),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      {customer.icon && <span>{customer.icon}</span>}
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-600">Type: {customer.type}</p>
                    <p className="text-sm text-gray-600">Location: {customer.location.name}</p>
                    <p className="text-sm text-gray-600">
                      {customer.location.city}, {customer.location.country}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {customer.inclusionType}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>

        {/* New Customer Form Overlay */}
        {newCustomerLocation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <CustomerForm
              lat={newCustomerLocation.lat}
              lng={newCustomerLocation.lng}
              onClose={() => {
                setNewCustomerLocation(null)
                setIsCreatingMode(false)
              }}
              onSubmit={handleCreateCustomer}
            />
          </div>
        )}

        {/* Edit Customer Form Overlay */}
        {editingCustomer && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <CustomerForm
              customer={editingCustomer}
              onClose={() => setEditingCustomer(null)}
              onSubmit={handleEditCustomer}
              isEditing={true}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCustomer} onOpenChange={() => setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCustomer?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
