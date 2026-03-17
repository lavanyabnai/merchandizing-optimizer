"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Factory, Warehouse, Truck, Search, Filter } from "lucide-react"
import type { Facility } from "@/components/map/facility"
import FacilityDetail from "@/components/map/facility-detail"

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

// Create custom icons for different facility types
const createCustomIcon = (type: string, status: string, isSelected = false) => {
  let iconColor = ""
  let borderColor = ""
  let IconComponent = Factory

  // Set color based on status
  switch (status.toLowerCase()) {
    case "operational":
      borderColor = "#10b981" // green-500
      break
    case "warning":
      borderColor = "#f59e0b" // yellow-500
      break
    case "critical":
      borderColor = "#ef4444" // red-500
      break
    default:
      borderColor = "#10b981" // green-500
  }

  // Set icon and background color based on type
  switch (type.toLowerCase()) {
    case "plant":
      IconComponent = Factory
      iconColor = "#1d4ed8" // blue-700
      break
    case "distribution":
      IconComponent = Warehouse
      iconColor = "#8b5cf6" // purple-500
      break
    case "supplier":
      IconComponent = Truck
      iconColor = "#f97316" // orange-500
      break
    default:
      IconComponent = Factory
      iconColor = "#1d4ed8" // blue-700
  }

  // If selected, use a bright highlight color and larger size
  const size = isSelected ? 40 : 32
  const highlightColor = isSelected ? "#fbbf24" : iconColor // yellow-400 for selected
  const borderWidth = isSelected ? 4 : 2

  const iconHtml = `
    <div style="background-color: ${highlightColor}; border: ${borderWidth}px solid ${borderColor}; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; box-shadow: ${isSelected ? "0 0 0 4px rgba(251, 191, 36, 0.3)" : "none"};">
      <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 20 : 16}" height="${isSelected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        ${
          IconComponent === Factory
            ? '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>'
            : IconComponent === Warehouse
              ? '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>'
              : '<path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/>'
        }
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

interface SupplyChainMapProps {
  facilities: Facility[]
  onSelectFacility: (facility: Facility) => void
  selectedFacilityId?: string
  selectedFacility: Facility | null
  onClose: () => void
  activeFilters: {
    types: {
      plants: boolean
      distribution: boolean
      suppliers: boolean
    }
    statuses: {
      operational: boolean
      warning: boolean
      critical: boolean
    }
  }
  toggleFilter: (filterType: "types" | "statuses", key: string) => void
}

export default function SupplyChainMap({
  facilities,
  onSelectFacility,
  selectedFacilityId,
  selectedFacility,
  onClose,
  activeFilters,
  toggleFilter,
}: SupplyChainMapProps) {
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(facilities)
  const [searchQuery, setSearchQuery] = useState("")
  const [mapCenter] = useState<[number, number]>([20, 0])

  // Filter facilities based on active filters and search query
  useEffect(() => {
    const filtered = facilities.filter((facility) => {
      // Filter by type
      const typeMatch =
        (facility.type.toLowerCase() === "plant" && activeFilters.types.plants) ||
        (facility.type.toLowerCase() === "distribution" && activeFilters.types.distribution) ||
        (facility.type.toLowerCase() === "supplier" && activeFilters.types.suppliers)

      // Filter by status
      const statusMatch =
        (facility.status.toLowerCase() === "operational" && activeFilters.statuses.operational) ||
        (facility.status.toLowerCase() === "warning" && activeFilters.statuses.warning) ||
        (facility.status.toLowerCase() === "critical" && activeFilters.statuses.critical)

      // Filter by search query
      const searchMatch =
        searchQuery === "" ||
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.country.toLowerCase().includes(searchQuery.toLowerCase())

      return typeMatch && statusMatch && searchMatch
    })

    setFilteredFacilities(filtered)
  }, [facilities, activeFilters, searchQuery])

  return (
    <div className="w-full h-full">
      <div className="bg-white shadow-sm flex justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-700 rounded-full p-1 mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-lg font-medium">Supply Chain Network</h1>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search facilities..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-sm px-3">
          <Filter className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600 mr-2">Filters:</span>
          <div className="flex space-x-1">
            <button
              onClick={() => toggleFilter("types", "plants")}
              className={`px-2 py-1 text-xs rounded-md ${
                activeFilters.types.plants ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              Plants
            </button>
            <button
              onClick={() => toggleFilter("types", "distribution")}
              className={`px-2 py-1 text-xs rounded-md ${
                activeFilters.types.distribution ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              Distribution
            </button>
            <button
              onClick={() => toggleFilter("types", "suppliers")}
              className={`px-2 py-1 text-xs rounded-md ${
                activeFilters.types.suppliers ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              Suppliers
            </button>
          </div>
          <div className="mx-2 h-4 border-l border-gray-300"></div>
          <div className="flex space-x-1">
            <button
              onClick={() => toggleFilter("statuses", "operational")}
              className={`px-2 py-1 text-xs rounded-md ${
                activeFilters.statuses.operational ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              Operational
            </button>
            <button
              onClick={() => toggleFilter("statuses", "warning")}
              className={`px-2 py-1 text-xs rounded-md ${
                activeFilters.statuses.warning ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              Warning
            </button>
            <button
              onClick={() => toggleFilter("statuses", "critical")}
              className={`px-2 py-1 text-xs rounded-md ${
                activeFilters.statuses.critical ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              Critical
            </button>
          </div>
        </div>
      </div>

      {/* Facility Detail */}
      {selectedFacility && (
        <div className="bg-white border-b border-gray-200 shadow-sm z-10">
          <FacilityDetail facility={{
            ...selectedFacility,
            id: Number(selectedFacility.id),
            performance: "0",
            status: selectedFacility.status as "Operational" | "Warning" | "Critical"
          }} onClose={onClose} />
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={3}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {filteredFacilities.map((facility) => (
          <Marker
            key={facility.id}
            position={[facility.lat, facility.lng]}
            icon={createCustomIcon(facility.type, facility.status, selectedFacilityId === facility.id)}
            eventHandlers={{
              click: () => {
                onSelectFacility(facility)
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  )
}
