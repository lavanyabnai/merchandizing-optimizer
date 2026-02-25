"use client"

import { useEffect, useState, useRef } from "react"
import type { ProductFlow } from "@/components/productFlow/product-flow-data"

interface ProductFlowMapProps {
  flows: ProductFlow[]
  selectedProduct?: string
  onSelectFlow?: (flow: ProductFlow) => void
}

export default function ProductFlowMap({ flows, selectedProduct, onSelectFlow }: ProductFlowMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const flowLayersRef = useRef<any>(null)
  const [leafletLib, setLeafletLib] = useState<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  // Filter flows by selected product
  const filteredFlows = selectedProduct ? flows.filter((f) => f.product === selectedProduct) : flows

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      try {
        const L = await import("leaflet")
        // await import("leaflet/dist/leaflet.css")

        setLeafletLib(L)

        // Fix Leaflet default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        })

        // Check if container already has a map and clean it up
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        // Clear the container HTML to ensure clean state
        if (mapRef.current) {
          mapRef.current.innerHTML = ""
        }

        // Create map centered on UK
        const map = L.map(mapRef.current!).setView([54.5, -2.5], 6)

        // Add tile layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        // Create layer group for flows
        const layers = L.layerGroup().addTo(map)

        mapInstanceRef.current = map
        flowLayersRef.current = layers
        setIsMapReady(true)
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initMap()

    return () => {
      // Cleanup function with proper access to map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (flowLayersRef.current) {
        flowLayersRef.current = null
      }
      setIsMapReady(false)
    }
  }, []) // Keep empty dependency array since we want this to run once per mount

  // Update flows when data changes
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !flowLayersRef.current || !leafletLib || !filteredFlows.length) return

    console.log("Updating flow map with", filteredFlows.length, "flows")

    // Clear existing layers
    flowLayersRef.current.clearLayers()

    // Get unique locations for markers
    const locations = new Map()

    filteredFlows.forEach((flow) => {
      // Add source location
      if (!locations.has(flow.from)) {
        locations.set(flow.from, {
          name: flow.from,
          lat: flow.sourceLat,
          lng: flow.sourceLng,
          type: "source",
          flows: [],
        })
      }
      locations.get(flow.from).flows.push(flow)

      // Add destination location
      if (!locations.has(flow.to)) {
        locations.set(flow.to, {
          name: flow.to,
          lat: flow.destLat,
          lng: flow.destLng,
          type: "destination",
          flows: [],
        })
      }
      locations.get(flow.to).flows.push(flow)
    })

    // Add location markers
    locations.forEach((location, name) => {
      const isSource = location.flows.some((f: ProductFlow) => f.from === name)
      const isDestination = location.flows.some((f: ProductFlow) => f.to === name)

      let markerColor = "#6b7280" // gray
      let markerIcon = "L"

      if (isSource && isDestination) {
        markerColor = "#8b5cf6" // purple - hub
        markerIcon = "H"
      } else if (isSource) {
        markerColor = "#059669" // green - source
        markerIcon = "S"
      } else {
        markerColor = "#dc2626" // red - destination
        markerIcon = "D"
      }

      const iconHtml = `
        <div style="
          background-color: ${markerColor}; 
          border: 2px solid white; 
          border-radius: 50%; 
          width: 28px; 
          height: 28px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          <span style="color: white; font-size: 12px; font-weight: bold;">
            ${markerIcon}
          </span>
        </div>
      `

      const marker = leafletLib.marker([location.lat, location.lng], {
        icon: leafletLib.divIcon({
          html: iconHtml,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      })

      // Add popup with location details
      const flowSummary = location.flows
        .map(
          (f: ProductFlow) =>
            `<div style="margin: 2px 0;">
          <strong>${f.product}</strong>: ${f.flow} units (£${f.cost.toFixed(2)})
        </div>`,
        )
        .join("")

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${location.name}</h3>
          <p style="margin: 4px 0; color: #6b7280;">
            ${isSource && isDestination ? "Hub" : isSource ? "Source" : "Destination"}
          </p>
          <div style="margin-top: 8px;">
            ${flowSummary}
          </div>
        </div>
      `)

      marker.addTo(flowLayersRef.current)
    })

    // Add flow lines
    filteredFlows.forEach((flow) => {
      // Create curved line for better visibility
      const sourcePoint = [flow.sourceLat, flow.sourceLng]
      const destPoint = [flow.destLat, flow.destLng]

      // Calculate line thickness based on flow volume
      const maxFlow = Math.max(...filteredFlows.map((f) => f.flow))
      const lineWeight = Math.max(2, Math.min(8, (flow.flow / maxFlow) * 8))

      // Color based on product type
      const productColors: { [key: string]: string } = {
        Vitamins: "#059669",
        Supplements: "#dc2626",
        Pharmaceuticals: "#2563eb",
        "Medical Devices": "#7c3aed",
        Vaccines: "#ea580c",
      }

      const lineColor = productColors[flow.product] || "#6b7280"

      const polyline = leafletLib.polyline([sourcePoint, destPoint], {
        color: lineColor,
        weight: lineWeight,
        opacity: 0.7,
        dashArray: flow.periods === "Peak period" ? "10, 5" : undefined,
      })

      polyline.on("click", () => {
        if (onSelectFlow) {
          onSelectFlow(flow)
        }
      })

      polyline.bindPopup(`
        <div style="min-width: 220px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${flow.from} → ${flow.to}</h3>
          <div style="margin: 4px 0;"><strong>Product:</strong> ${flow.product}</div>
          <div style="margin: 4px 0;"><strong>Flow:</strong> ${flow.flow} units</div>
          <div style="margin: 4px 0;"><strong>Distance:</strong> ${flow.distance.toFixed(1)} km</div>
          <div style="margin: 4px 0;"><strong>Cost:</strong> £${flow.cost.toFixed(2)}</div>
          <div style="margin: 4px 0;"><strong>Period:</strong> ${flow.periods}</div>
        </div>
      `)

      polyline.addTo(flowLayersRef.current)
    })
  }, [filteredFlows, isMapReady, leafletLib, onSelectFlow])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Legend */}
      <div className="bg-white p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Product Flow Map</h3>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-600 mr-1"></div>
              <span>Source</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-600 mr-1"></div>
              <span>Destination</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-600 mr-1"></div>
              <span>Hub</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-gray-600 mr-1"></div>
              <span>Flow (thickness = volume)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1" style={{ minHeight: "400px" }} />
    </div>
  )
}
