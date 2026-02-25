"use client"

import { X, MapPin, Building, Users, Truck, Factory } from "lucide-react"
// import type { Facility } from "@/components/map/facility"

interface UKFacilityDetailProps {
  facility: any
  onClose: () => void
}

export default function UKFacilityDetail({ facility, onClose }: UKFacilityDetailProps) {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "customer":
        return <Users className="h-5 w-5 text-emerald-600" />
      case "plant":
      case "factory":
        return <Factory className="h-5 w-5 text-blue-600" />
      case "distribution":
      case "warehouse":
        return <Building className="h-5 w-5 text-purple-600" />
      case "supplier":
        return <Truck className="h-5 w-5 text-orange-600" />
      default:
        return <Building className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "operational":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="px-2 py-4 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            {getTypeIcon(facility.type)}
            <div>
              <h2 className="text-lg font-bold text-gray-900">{facility.name}</h2>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {facility.address}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Type</span>
              <div className="text-sm font-medium text-gray-900 capitalize">{facility.type}</div>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</span>
              <div className={`text-sm font-medium px-2 py-1 rounded-md border ${getStatusColor(facility.status)}`}>
                {facility.status}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Performance</span>
              <div className="text-sm font-medium text-gray-900">{facility.efficiency}%</div>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Coordinates</span>
              <div className="text-sm text-gray-900">
                {facility.lat.toFixed(4)}, {facility.lng.toFixed(4)}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
