"use client"

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Users, Building2, Factory, Truck, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGetCustomers } from "@/features/customers/api/use-get-customers"
import { useGetLocations } from "@/features/locations/api/use-get-locations"

// Entity type configuration - easily extensible
const ENTITY_TYPES = {
  customers: {
    label: "Customers",
    icon: Users,
    color: "#3b82f6",
    hook: useGetCustomers,
  },
  distribution: {
    label: "Distribution Centers",
    icon: Building2,
    color: "#8b5cf6",
    hook: null, // To be implemented
  },
  factories: {
    label: "Factories",
    icon: Factory,
    color: "#ef4444",
    hook: null, // To be implemented
  },
  suppliers: {
    label: "Suppliers",
    icon: Truck,
    color: "#f97316",
    hook: null, // To be implemented
  },
} as const

type EntityType = keyof typeof ENTITY_TYPES

interface ExtensibleSupplyChainMapProps {
  className?: string
}

export default function ExtensibleSupplyChainMap({ className }: ExtensibleSupplyChainMapProps) {
  const { data: customers = [], isLoading: customersLoading } = useGetCustomers()
  const { data: locations = [], isLoading: locationsLoading } = useGetLocations()

 
  const [searchQuery, setSearchQuery] = useState("")
  const [mapCenter] = useState<[number, number]>([40.7128, -74.006])
  const [activeFilters, setActiveFilters] = useState({
    customers: true,
    distribution: true,
    factories: true,
    suppliers: true,
  })

  // Create custom icons
  const createIcon = (entityType: EntityType, isSelected = false) => {
    const config = ENTITY_TYPES[entityType]
    const size = isSelected ? 40 : 32
    const IconComponent = config.icon

    const iconHtml = `
      <div style="background-color: ${config.color}; border: 2px solid white; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 20 : 16}" height="${isSelected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          ${getIconPath(IconComponent)}
        </svg>
      </div>
    `

    return L.divIcon({
      html: iconHtml,
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
  }

  const getIconPath = (IconComponent: any) => {
    if (IconComponent === Users) {
      return '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.8-7.8 5.5 5.5 0 0 0 7.8 7.8Z"/>'
    } else if (IconComponent === Building2) {
      return '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>'
    } else if (IconComponent === Factory) {
      return '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>'
    } else if (IconComponent === Truck) {
      return '<path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/>'
    }
    return ""
  }

  const toggleFilter = (entityType: EntityType) => {
    setActiveFilters((prev) => ({
      ...prev,
      [entityType]: !prev[entityType],
    }))
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
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Supply Chain Map</h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Entity Type Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 mr-2">Show:</span>
          {Object.entries(ENTITY_TYPES).map(([key, config]) => {
            const entityType = key as EntityType
            const IconComponent = config.icon
            return (
              <Button
                key={key}
                variant={activeFilters[entityType] ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(entityType)}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {config.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={10} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Customer Markers */}
          {activeFilters.customers &&
            customers.map((customer: any) => {
              const location = locations.find((loc: any) => loc.id === customer.locationId)
              if (!location?.latitude || !location?.longitude) return null

              return (
                <Marker
                  key={`customer-${customer.id}`}
                  position={[location.latitude, location.longitude]}
                  icon={createIcon("customers")}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{customer.name}</h3>
                      <p className="text-sm text-gray-600">Customer - {customer.type}</p>
                      <p className="text-sm text-gray-600">{location.name}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            })}

          {/* Placeholder for other entity types */}
          {/* Distribution Centers, Factories, and Suppliers can be added here */}
        </MapContainer>
      </div>
    </div>
  )
}
