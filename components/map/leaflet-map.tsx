"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Factory, Warehouse, Truck, Search, Filter, CheckCircle, AlertTriangle, AlertCircle, Store } from "lucide-react"
import type { LocationData } from "@/types/location"
import FacilityDetail from "./facility-detail"
import { useTheme } from "next-themes"

// Fix Leaflet icon issues
// This needs to be outside the component to avoid the "Rendered more hooks than during the previous render" error
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

const useLeafletIcons = () => {
  useEffect(() => {
    // This is needed to fix the marker icon issue with Leaflet in Next.js
  }, [])
}

// Create custom icons for different facility types
const createCustomIcon = (type: string, status: string) => {
  let iconHtml = ""
  let iconColor = ""

  // Set color based on status
  switch (status) {
    case "Operational":
      iconColor = "#60a5fa" // blue-400
      break
    case "Warning":
      iconColor = "#facc15" // yellow-400
      break
    case "Critical":
      iconColor = "#f87171" // red-400
      break
    default:
      iconColor = "#60a5fa" // blue-400
  }

  // Set icon based on type
  switch (type) {
    case "plant":
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-factory"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>`
      break
    case "distribution":
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-warehouse"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/></svg>`
      break
    case "supplier":
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-truck"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/></svg>`
      break
    case "store":
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>`
      break
    default:
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  }

  return L.divIcon({
    html: `<div class="facility-icon" style="background-color: rgba(31, 41, 55, 0.8); border-radius: 50%; padding: 8px; border: 2px solid ${iconColor};">${iconHtml}</div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

// Get status icon based on facility status
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Operational":
      return <CheckCircle className="h-4 w-4 text-green-400" />
    case "Warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    case "Critical":
      return <AlertCircle className="h-4 w-4 text-red-400" />
    default:
      return <CheckCircle className="h-4 w-4 text-green-400" />
  }
}

// Get facility icon based on type
const getFacilityIcon = (type: string) => {
  switch (type) {
    case "plant":
      return <Factory className="h-5 w-5" />
    case "distribution":
      return <Warehouse className="h-5 w-5" />
    case "supplier":
      return <Truck className="h-5 w-5" />
    case "store":
      return <Store className="h-5 w-5" />
    default:
      return <Factory className="h-5 w-5" />
  }
}

// Component to handle map filters
function MapFilters({ filters, setFilters }: any) {
  // Toggle filter for facility type
  const toggleTypeFilter = (type: keyof typeof filters.types) => {
    setFilters((prev: any) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }))
  }

  // Toggle filter for facility status
  const toggleStatusFilter = (status: keyof typeof filters.statuses) => {
    setFilters((prev: any) => ({
      ...prev,
      statuses: {
        ...prev.statuses,
        [status]: !prev.statuses[status],
      },
    }))
  }

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001] pointer-events-auto">
      <div className="flex items-center">
        <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
        <span className="text-sm text-gray-700 dark:text-gray-300">Filters:</span>
      </div>

      {/* Type filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => toggleTypeFilter("plant")}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
            filters.types.plant
              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          <Factory className="h-3 w-3" />
          <span>Plants</span>
        </button>
        <button
          onClick={() => toggleTypeFilter("distribution")}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
            filters.types.distribution
              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          <Warehouse className="h-3 w-3" />
          <span>Distribution</span>
        </button>
        <button
          onClick={() => toggleTypeFilter("supplier")}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
            filters.types.supplier
              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          <Truck className="h-3 w-3" />
          <span>Suppliers</span>
        </button>
        <button
          onClick={() => toggleTypeFilter("store")}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
            filters.types.store
              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          <Store className="h-3 w-3" />
          <span>Stores</span>
        </button>
      </div>

      {/* Status filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => toggleStatusFilter("Operational")}
          className={`px-2 py-1 rounded-md text-xs ${
            filters.statuses.Operational
              ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          Operational
        </button>
        <button
          onClick={() => toggleStatusFilter("Warning")}
          className={`px-2 py-1 rounded-md text-xs ${
            filters.statuses.Warning
              ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          Warning
        </button>
        <button
          onClick={() => toggleStatusFilter("Critical")}
          className={`px-2 py-1 rounded-md text-xs ${
            filters.statuses.Critical
              ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          Critical
        </button>
      </div>
    </div>
  )
}

// Component to handle search functionality
function SearchBox({ locations, onSelectFacility }: any) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = locations.filter(
      (location: LocationData) =>
        location.name.toLowerCase().includes(query) || location.country.toLowerCase().includes(query),
    )
    setSearchResults(results)
  }, [searchQuery, locations])

  // Focus on a specific facility
  const focusOnFacility = (facility: LocationData) => {
    onSelectFacility(facility)
    setShowSearchResults(false)
    setSearchQuery("")
  }

  return (
    <div className="absolute top-4 right-4 z-[1001] pointer-events-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search facilities..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowSearchResults(true)
          }}
        />
      </div>

      {/* Search results */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
              onClick={() => focusOnFacility(result)}
            >
              <div className="mr-2">{getFacilityIcon(result.type)}</div>
              <div>
                <div className="text-sm text-gray-900 dark:text-white">{result.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{result.country}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Component to handle map center changes
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap()
  map.setView(center, 5)
  return null
}

// Component to handle map tile layer based on theme
function ThemeAwareMapLayer() {
  const { theme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string | undefined>("dark")

  useEffect(() => {
    setCurrentTheme(theme)
  }, [theme])

  return currentTheme === "dark" ? (
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    />
  ) : (
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    />
  )
}

export default function LeafletMap({ locations }: { locations: LocationData[] }) {
  const [selectedFacility, setSelectedFacility] = useState<LocationData | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0])
  const [filters, setFilters] = useState({
    types: {
      plant: true,
      distribution: true,
      supplier: true,
      store: true,
    },
    statuses: {
      Operational: true,
      Warning: true,
      Critical: true,
    },
  })
  const { theme } = useTheme()

  // Filter locations based on current filters
  const filteredLocations = locations.filter(
    (location) =>
      filters.types[location.type as keyof typeof filters.types] &&
      filters.statuses[location.status as keyof typeof filters.statuses],
  )

  // Handle facility selection from search
  const handleSelectFacility = (facility: LocationData) => {
    setSelectedFacility(facility)
    setMapCenter([facility.lat, facility.lng])
  }

  useLeafletIcons()

  return (
    <div className="w-full h-full">
      {/* Facility Detail Tab */}
      {selectedFacility && (
        <div className="top-0 left-0 right-0 z-[1000] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md">
          <FacilityDetail 
            facility={selectedFacility}
            onClose={() => setSelectedFacility(null)} 
          />
        </div>
      )}

      {/* Map Filters */}
      <div className="top-4 left-1/2 transform -translate-x-1/2 z-[1001] pointer-events-auto">
        <MapFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Search Box */}
      <div className=" top-4 right-4 z-[1001] pointer-events-auto">
        <SearchBox locations={locations} onSelectFacility={handleSelectFacility} />
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={2}
        style={{ height: "100%", width: "100%", background: theme === "dark" ? "#1f2937" : "#f3f4f6" }}
        zoomControl={false}
        attributionControl={false}
      >
        <ThemeAwareMapLayer />
        <ZoomControl position="bottomright" />

        {/* Update map center when selected facility changes */}
        {selectedFacility && <ChangeMapView center={[selectedFacility.lat, selectedFacility.lng]} />}

        {/* Markers for each facility */}
        {filteredLocations.map((facility) => (
          <Marker
            key={facility.id}
            position={[facility.lat, facility.lng]}
            icon={createCustomIcon(facility.type, facility.status)}
            eventHandlers={{
              click: () => {
                setSelectedFacility(facility)
              },
            }}
          >
            <Popup className="facility-popup">
              <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-md border border-gray-200 dark:border-gray-700 min-w-[200px]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{facility.name}</h3>
                  {getStatusIcon(facility.status)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {facility.country} • {facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
                </div>
                <button
                  onClick={() => setSelectedFacility(facility)}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Attribution */}
        {/* <div className="leaflet-bottom leaflet-left">
          <div className="leaflet-control leaflet-bar bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs p-1 rounded">
            © OpenStreetMap © CARTO
          </div>
        </div> */}
      </MapContainer>

      {/* Facility Detail Panel */}
      {/* {selectedFacility && <FacilityDetail facility={selectedFacility} onClose={() => setSelectedFacility(null)} />} */}

      {/* Custom CSS for Leaflet popups */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: transparent;
          box-shadow: none;
        }
        .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .facility-icon svg {
          display: block;
        }
      `}</style>
    </div>
  )
}
