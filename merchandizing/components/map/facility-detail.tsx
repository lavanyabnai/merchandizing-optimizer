"use client"

import { X } from "lucide-react"
import type { LocationData } from "@/types/location"

interface FacilityDetailProps {
  facility: LocationData
  onClose: () => void
}

export default function FacilityDetail({ facility, onClose }: FacilityDetailProps) {
  return (
    <div className="px-6 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{facility.name}</h2>
              <p className="text-sm text-gray-600">
                {facility.country} • {facility.type}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
              <div
                className={`text-sm font-medium ${
                  facility.status === "Operational"
                    ? "text-green-600"
                    : facility.status === "Warning"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {facility.status}
              </div>
            </div>

            {facility.capacity && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Capacity</span>
                <div className="text-sm font-medium text-gray-900">{facility.capacity}</div>
              </div>
            )}

            {facility.performance && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Performance</span>
                <div className="text-sm font-medium text-gray-900">{facility.performance}</div>
              </div>
            )}

            {facility.lastIncident && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Last Incident</span>
                <div className="text-sm text-gray-900">{facility.lastIncident}</div>
              </div>
            )}
          </div>
        </div>

        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
