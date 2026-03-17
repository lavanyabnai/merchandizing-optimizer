"use client"

import { useState, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  Factory,
  Users,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Building2,
  Truck,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Gauge,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { NewCustomerSheet } from "./create-entity-modal"
import { useNewCustomer } from "@/features/customers/hooks/use-new-customer"
import { useCreateLocation } from "./use-create-location"
import { useGetCustomers } from "@/features/customers/api/use-get-customers"
import { useGetFacilities } from "@/features/facilities/api/use-get-facilities"
import { useGetSuppliers } from "@/features/suppliers/api/use-get-suppliers"
import { useGetLocations } from "@/features/locations/api/use-get-locations"
import type { MapEntity, EntityType, MapClickEvent } from "@/components/intermap/map-entities"
import { toast } from "sonner"
import { createElement } from "react"
import { renderToString } from "react-dom/server"

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

// Function to get React icon component based on entity type
const getEntityIcon = (entityType: EntityType, customIcon?: string) => {
  // If custom icon is provided, try to use it, otherwise use default based on type
  if (customIcon) {
    // You can add logic here to map custom icon strings to React icons
    // For now, fall back to type-based icons
  }

  switch (entityType) {
    case "customer":
      return User
    case "distribution":
      return Package
    case "factory":
      return Factory
    case "supplier":
      return Truck
    default:
      return Building2
  }
}

// Create custom icons for different entity types
const createCustomIcon = (entity: MapEntity, isSelected = false) => {
  let iconColor = ""
  // Set icon and color based on type
  switch (entity.type) {
    case "customer":
      iconColor = "#3b82f6" // blue-500
      break
    case "distribution":
      iconColor = "#ec4899" // pink-500
      break
    case "factory":
      iconColor = "#f59e42" // orange-400
      break
    case "supplier":
      iconColor = "#22c55e" // green-500
      break
  }

  const size = isSelected ? 40 : 32
  const highlightColor = isSelected ? "#fbbf24" : iconColor
  const borderWidth = isSelected ? 4 : 2
  const outlineStyle = isSelected ? "2px dotted #fbbf24" : "none"

  // Get the React icon component
  const IconComponent = getEntityIcon(entity.type, entity.icon)

  // Render React icon to HTML string
  const iconContent = renderToString(
    createElement(IconComponent, {
      size: isSelected ? 20 : 16,
      color: "white",
      strokeWidth: 2,
    }),
  )

  const iconHtml = `
    <div style="background-color: ${highlightColor}; border: ${borderWidth}px solid white; border-radius: 50%; outline: ${outlineStyle}; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
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

// const getIconPath = (type: EntityType): string => {
//   switch (type) {
//     case "customer":
//       return '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z"/>'
//     case "factory":
//       return '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>'
//     case "distribution":
//       return '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>'
//     case "supplier":
//       return '<path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/>'
//     default:
//       return '<circle cx="12" cy="12" r="10"/>'
//   }
// }

// Enhanced Popup Content Component
const PopupContent = ({ entity }: { entity: MapEntity }) => {
  // Get the main icon color (matching the createCustomIcon function)
  // const getIconColor = (type: EntityType) => {
  //   switch (type) {
  //     case "customer":
  //       return "#3b82f6" // blue-500
  //     case "distribution":
  //       return "#ec4899" // pink-500
  //     case "factory":
  //       return "#f59e42" // orange-400
  //     case "supplier":
  //       return "#22c55e" // green-500
  //     default:
  //       return "#6b7280" // gray-500
  //   }
  // }

  const getEntityTypeColor = (type: EntityType) => {
    switch (type) {
      case "customer":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "distribution":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "factory":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "supplier":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case "customer":
        return <User className="h-4 w-4" />
      case "distribution":
        return <Package className="h-4 w-4" />
      case "factory":
        return <Factory className="h-4 w-4" />
      case "supplier":
        return <Truck className="h-4 w-4" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // const iconColor = getIconColor(entity.type)

  // Add this helper function inside the PopupContent component
  // const getEntityBgColor = (type: EntityType) => {
  //   switch (type) {
  //     case "customer":
  //       return "bg-blue-100"
  //     case "distribution":
  //       return "bg-pink-100"
  //     case "factory":
  //       return "bg-orange-100"
  //     case "supplier":
  //       return "bg-green-100"
  //     default:
  //       return "bg-gray-100"
  //   }
  // }

  return (
    <div className="w-80 p-0">
      <Card className={`border-0 shadow-none ${getEntityTypeColor(entity.type).split(' ')[0]}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${getEntityTypeColor(entity.type)}`}>{getEntityIcon(entity.type)}</div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">{entity.name}</CardTitle>
                <Badge variant="secondary" className={`mt-1 ${getEntityTypeColor(entity.type)} text-xs font-medium`}>
                  {entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Location Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">{entity.locationName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
              <span>
                {entity.city}, {entity.country}
              </span>
            </div>
            {entity.address && entity.address !== "Unknown" && (
              <div className="flex items-start gap-2 text-sm text-gray-600 ml-6">
                <span className="text-xs">{entity.address}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          {(entity.phone || entity.email || entity.website) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Contact</h4>
              {entity.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{entity.phone}</span>
                </div>
              )}
              {entity.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span>{entity.email}</span>
                </div>
              )}
              {entity.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="h-3 w-3" />
                  <span className="text-blue-600 hover:underline cursor-pointer">{entity.website}</span>
                </div>
              )}
            </div>
          )}

          {/* Facility-specific details */}
          {(entity.type === "distribution" || entity.type === "factory") && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Facility Details</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-3 w-3" />
                  <span>Type: {(entity as any).facilityType || "Unknown"}</span>
                </div>
                {(entity as any).capacity && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Gauge className="h-3 w-3" />
                    <span>
                      Capacity: {(entity as any).capacity} {(entity as any).capacityUnit || "units"}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

         

          {/* Additional Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Created: {entity.createdAt ? formatDate(entity.createdAt) : "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {entity.inclusionType || "Unknown"}
                </Badge>
              </div>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              {entity.lat.toFixed(4)}, {entity.lng.toFixed(4)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Map click handler component
function MapClickHandler({
  onMapClick,
  isAddingMode,
}: {
  onMapClick: (e: MapClickEvent) => void
  isAddingMode: boolean
}) {
  useMapEvents({
    click: (e) => {
      if (isAddingMode) {
        onMapClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        })
      }
    },
  })
  return null
}

interface InteractiveSupplyChainMapProps {
  onSelectEntity?: (entity: MapEntity) => void
  selectedEntityId?: number
}

export default function InteractiveSupplyChainMap({
  onSelectEntity,
  selectedEntityId,
}: InteractiveSupplyChainMapProps) {
  const { data: customers = [], isLoading: customersLoading } = useGetCustomers()
  const { data: facilities = [], isLoading: facilitiesLoading } = useGetFacilities()
  const { data: suppliers = [], isLoading: suppliersLoading } = useGetSuppliers()
  const { data: locations = [], isLoading: locationsLoading } = useGetLocations()
  const { onOpen } = useNewCustomer()
  const createLocation = useCreateLocation()

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingMode, setIsAddingMode] = useState(false)
  const [isCreatingLocation, setIsCreatingLocation] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    types: {
      customer: true,
      distribution: true,
      factory: true,
      supplier: true,
    },
  })

  // Transform customers, facilities, suppliers and locations data into MapEntity format
  const { mapEntities, locationsWithoutCoordinates } = useMemo(() => {
    if (!customers || !locations || !facilities || !suppliers)
      return { mapEntities: [], locationsWithoutCoordinates: [] }

    const locationMap = new Map(locations.map((loc: any) => [loc.id, loc]))
    const entitiesWithoutCoords: any[] = []
    const validEntities: MapEntity[] = []

    // Helper function to process entities
    const processEntities = (items: any[], entityType: EntityType) => {
      items.forEach((item: any) => {
        const location = locationMap.get(item.locationId)
        if (!location) return

        // Check if location has valid coordinates
        if (
          !location.latitude ||
          !location.longitude ||
          typeof location.latitude !== "number" ||
          typeof location.longitude !== "number" ||
          isNaN(location.latitude) ||
          isNaN(location.longitude)
        ) {
          entitiesWithoutCoords.push({
            name: item.name,
            type: entityType,
            location: location.name,
            reason: "Missing or invalid coordinates",
          })
          return
        }

        validEntities.push({
          id: item.id,
          name: item.name,
          type: entityType,
          locationId: item.locationId,
          inclusionType: item.inclusionType || "default",
          additionalParams: item.additionalParams || {},
          icon: item.icon,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          locationName: location.name,
          lat: location.latitude,
          lng: location.longitude,
          country: location.country || "Unknown",
          city: location.city || "Unknown",
          address: location.address || "Unknown",
          phone: location.phone,
          email: location.email,
          website: location.website,
          // Add facility-specific fields
          facilityType: item.type,
          capacity: item.capacity,
          capacityUnit: item.capacityUnit,
        } as MapEntity)
      })
    }

    // Process all entity types
    processEntities(customers, "customer")

    // Process facilities - separate by type
    const distributionCenters = facilities.filter(
      (facility: any) => facility.type === "DC" || facility.type === "Distribution" || facility.type === "Warehouse",
    )
    const factories = facilities.filter(
      (facility: any) => facility.type === "Factory" || facility.type === "Plant" || facility.type === "Manufacturing",
    )

    // Process distribution centers and factories
    processEntities(distributionCenters, "distribution")
    processEntities(factories, "factory")

    // Process any remaining facilities as distribution centers by default
    const remainingFacilities = facilities.filter(
      (facility: any) => !distributionCenters.includes(facility) && !factories.includes(facility),
    )
    processEntities(remainingFacilities, "distribution")

    processEntities(suppliers, "supplier")

    return {
      mapEntities: validEntities,
      locationsWithoutCoordinates: entitiesWithoutCoords,
    }
  }, [customers, locations, facilities, suppliers])

  // Filter entities based on active filters and search query
  const filteredEntities = useMemo(() => {
    return mapEntities.filter((entity) => {
      // Filter by type
      const typeMatch = activeFilters.types[entity.type]
      // Filter by search query
      const searchMatch =
        searchQuery === "" ||
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.city.toLowerCase().includes(searchQuery.toLowerCase())

      return typeMatch && searchMatch
    })
  }, [mapEntities, activeFilters, searchQuery])

  // Calculate map center based on entities
  const mapCenter = useMemo((): [number, number] => {
    if (filteredEntities.length === 0) {
      return [40.7128, -74.006] // Default to NYC
    }

    const avgLat = filteredEntities.reduce((sum, entity) => sum + entity.lat, 0) / filteredEntities.length
    const avgLng = filteredEntities.reduce((sum, entity) => sum + entity.lng, 0) / filteredEntities.length

    return [avgLat, avgLng]
  }, [filteredEntities])

  const toggleFilter = (type: EntityType) => {
    setActiveFilters((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }))
  }

  // Function to get location name from coordinates using reverse geocoding
  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      )
      const data = await response.json()

      if (data && data.display_name) {
        // Extract city and country from the response
        const address = data.address || {}
        const city = address.city || address.town || address.village || address.county || "Unknown City"
        const country = address.country || "Unknown Country"
        return `${city}, ${country}`
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
    }

    // Fallback to coordinates if geocoding fails
    return `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  const handleMapClick = async (clickEvent: MapClickEvent) => {
    if (isAddingMode && !isCreatingLocation) {
      setIsCreatingLocation(true)
      toast.loading("Creating location...")

      try {
        // Get location name from coordinates
        const locationName = await getLocationName(clickEvent.lat, clickEvent.lng)

        // Extract city and country from location name
        const parts = locationName.split(", ")
        const city = parts[0] || "Unknown City"
        const country = parts[parts.length - 1] || "Unknown Country"

        // Create location in database
        const locationData = {
          name: locationName,
          latitude: clickEvent.lat,
          longitude: clickEvent.lng,
          city: city,
          country: country,
          address: locationName,
        }

        const result = await createLocation.mutateAsync(locationData)

        toast.dismiss()
        toast.success(`Location "${locationName}" created successfully!`)

        // Open customer form with the new location and click position
        if ("data" in result && result.data && "id" in result.data) {
          onOpen()
        } else {
          toast.error("Failed to retrieve new location ID.")
        }

        setIsAddingMode(false)
      } catch (error) {
        toast.dismiss()
        toast.error("Failed to create location. Please try again.")
        console.error("Failed to create location:", error)
      } finally {
        setIsCreatingLocation(false)
      }
    }
  }

  const handleAddEntity = () => {
    setIsAddingMode(true)
  }

  const getEntityTypeStats = () => {
    const stats = {
      customer: 0,
      distribution: 0,
      factory: 0,
      supplier: 0,
    }

    mapEntities.forEach((entity) => {
      stats[entity.type]++
    })

    return stats
  }

  const stats = getEntityTypeStats()

  if (customersLoading || locationsLoading || facilitiesLoading || suppliersLoading) {
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
    <>
      <div className="w-full h-full flex flex-col">
        {locationsWithoutCoordinates.length > 0 && (
          <Alert className="mx-4 mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {locationsWithoutCoordinates.length} entities cannot be displayed on the map due to missing coordinates.
              Please update location data with valid latitude and longitude values.
            </AlertDescription>
          </Alert>
        )}     
   

        {/* Header */}
        <div className="bg-white shadow-sm flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-700 rounded-full p-1 mr-2">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-medium">Interactive Supply Chain Map</h1>
            <div className="ml-4 flex items-center gap-4 text-sm text-gray-600">
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {stats.customer} Customers
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {stats.distribution} Distribution
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Factory className="h-3 w-3" />
                {stats.factory} Factories
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                {stats.supplier} Suppliers
              </Badge>
              <Badge variant="outline">📍 {locations.length} Locations</Badge>
              {locationsWithoutCoordinates.length > 0 && (
                <Badge variant="destructive">⚠️ {locationsWithoutCoordinates.length} Missing Coords</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search entities..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Add Entity Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isAddingMode ? "default" : "outline"}
                onClick={handleAddEntity}
                className="flex items-center gap-1"
                disabled={isCreatingLocation}
              >
                <Users className="h-4 w-4" />
                {isCreatingLocation ? "Creating Location..." : "Add Customer"}
              </Button>
              {/* You can add more buttons here for facilities and suppliers if needed */}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Show:</span>
            </div>
            <div className="flex gap-2">
              {Object.entries(activeFilters.types).map(([type, active]) => (
                <Button
                  key={type}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => toggleFilter(type as EntityType)}
                  className="text-xs"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}s ({stats[type as EntityType]})
                </Button>
              ))}
            </div>
            {isAddingMode && (
              <div className="ml-auto flex items-center gap-2 text-sm text-blue-600">
                <Plus className="h-4 w-4" />
                {isCreatingLocation
                  ? "Creating location and opening customer form..."
                  : "Click on the map to create a location and add a customer"}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingMode(false)}
                  disabled={isCreatingLocation}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[500px] relative">
          {filteredEntities.length > 0 || locations.length > 0 ? (
            <MapContainer
              center={mapCenter}
              zoom={6}
              style={{ height: "100%", width: "100%", zIndex: 1 }}
              className={isAddingMode ? "cursor-crosshair" : ""}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <MapClickHandler onMapClick={handleMapClick} isAddingMode={isAddingMode} />
              {filteredEntities.map((entity) => (
                <Marker
                  key={`${entity.type}-${entity.id}`}
                  position={[entity.lat, entity.lng]}
                  icon={createCustomIcon(entity, selectedEntityId === entity.id)}
                  eventHandlers={{
                    click: () => {
                      if (!isAddingMode && onSelectEntity) {
                        onSelectEntity(entity)
                      }
                    },
                  }}
                >
                  <Popup maxWidth={320} className="custom-popup ">
                    <PopupContent entity={entity} />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <Factory className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No locations to display</h3>
                <p className="text-gray-600 mb-4">
                  Click "Add Customer" and then click anywhere on the map to create a location and add a customer.
                </p>
                <Button onClick={handleAddEntity} disabled={isCreatingLocation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* New Customer Sheet */}
      <NewCustomerSheet />
    </>
  )
}
