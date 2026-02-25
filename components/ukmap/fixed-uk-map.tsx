"use client"

import { useEffect, useState, useRef } from "react"
import type { Facility } from "@/components/map/facility"
import UKFacilityDetail from "@/components/ukmap/uk-facility-detail"
import "leaflet/dist/leaflet.css"

interface FixedUKMapProps {
  facilities: Facility[]
  onSelectFacility: (facility: Facility) => void
  selectedFacility: Facility | null
  onClose: () => void
}

export default function FixedUKMap({ facilities, onSelectFacility, selectedFacility, onClose }: FixedUKMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null) // Use ref instead of state for map instance
  const [markersLayer, setMarkersLayer] = useState<any>(null)
  const [leafletLib, setLeafletLib] = useState<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Remove any existing map instance on this element
    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
    }

    const initMap = async () => {
      const L = await import("leaflet")

      // Store Leaflet library for later use
      setLeafletLib(L)

      // Fix Leaflet default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })

      // Create map
      const map = L.map(mapRef.current!).setView([54.5, -2.5], 6)
      mapInstanceRef.current = map // Store in ref

      // Add tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map)

      // Create layer group for markers
      const markers = L.layerGroup().addTo(map)

      setMarkersLayer(markers)
    }

    initMap().catch(console.error)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when facilities change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayer || !leafletLib) return

    console.log("Updating markers for", facilities.length, "facilities")

    // Clear existing markers
    markersLayer.clearLayers()

    // Add new markers
    facilities.forEach((facility) => {
      // Create custom icon based on type
      const getIconColor = (type: string) => {
        switch (type.toLowerCase()) {
          case "customer":
            return "#059669" // emerald
          case "plant":
            return "#1d4ed8" // blue
          case "distribution":
            return "#8b5cf6" // purple
          case "supplier":
            return "#f97316" // orange
          default:
            return "#6b7280" // gray
        }
      }

      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case "operational":
            return "#10b981" // green
          case "warning":
            return "#f59e0b" // yellow
          case "critical":
            return "#ef4444" // red
          default:
            return "#10b981" // green
        }
      }

      const iconHtml = `
        <div style="
          background-color: ${getIconColor(facility.type)}; 
          border: 3px solid ${getStatusColor(facility.status)}; 
          border-radius: 50%; 
          width: 32px; 
          height: 32px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          <span style="color: white; font-size: 14px; font-weight: bold;">
            ${facility.type.charAt(0).toUpperCase()}
          </span>
        </div>
      `

      const customIcon = leafletLib.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = leafletLib.marker([facility.lat, facility.lng], { icon: customIcon })

      // Add click handler
      marker.on("click", (e: any) => {
        console.log("Marker clicked:", facility.name, facility)
        e.originalEvent?.stopPropagation()
        onSelectFacility(facility)
      })

      // Add popup with better styling
      marker.bindPopup(`
        <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="margin: 0 0 12px 0; font-weight: bold; color: #1f2937; font-size: 16px;">${facility.name}</h3>
          <div style="margin: 6px 0;">
            <span style="font-weight: 600; color: #374151;">Type:</span> 
            <span style="color: ${getIconColor(facility.type)}; font-weight: 500;">${facility.type}</span>
          </div>
          <div style="margin: 6px 0;">
            <span style="font-weight: 600; color: #374151;">Status:</span> 
            <span style="color: ${getStatusColor(facility.status)}; font-weight: 500;">${facility.status}</span>
          </div>
          <div style="margin: 6px 0;">
            <span style="font-weight: 600; color: #374151;">Location:</span> 
            <span style="color: #6b7280;">${facility.address}</span>
          </div>
          <div style="margin: 6px 0;">
            <span style="font-weight: 600; color: #374151;">Performance:</span> 
            <span style="color: #059669;">${facility.efficiency}%</span>
          </div>
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <small style="color: #6b7280;">Click marker for detailed view</small>
          </div>
        </div>
      `)

      marker.addTo(markersLayer)
    })

    console.log("Added", facilities.length, "markers to map")
  }, [facilities, markersLayer, leafletLib, onSelectFacility])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
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
            <h1 className="text-lg font-medium">UK Cold Chain Network</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">({facilities.length} locations)</span>
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-600 mr-1"></div>
                <span>Customer</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600 mr-1"></div>
                <span>Plant</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-600 mr-1"></div>
                <span>Distribution</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-600 mr-1"></div>
                <span>Supplier</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Detail */}
      {selectedFacility && <UKFacilityDetail facility={selectedFacility} onClose={onClose} />}

      {/* Map */}
      <div ref={mapRef} className="flex-1" style={{ minHeight: "400px" }} />
    </div>
  )
}
