"use client"

import { X, MapPin, Phone, Mail, Globe, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MapEntity } from "@/components/intermap/map-entities"

interface EntityDetailProps {
  entity: MapEntity
  onClose: () => void
}

export default function EntityDetail({ entity, onClose }: EntityDetailProps) {
  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case "customer":
        return "bg-blue-100 text-blue-800"
      case "distribution":
        return "bg-purple-100 text-purple-800"
      case "factory":
        return "bg-indigo-100 text-indigo-800"
      case "supplier":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInclusionTypeColor = (type: string) => {
    switch (type) {
      case "Include":
        return "bg-green-100 text-green-800"
      case "Exclude":
        return "bg-red-100 text-red-800"
      case "Consider":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{entity.icon || "📍"}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{entity.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getEntityTypeColor(entity.type)}>
                  {entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}
                </Badge>
                {entity.inclusionType && (
                  <Badge className={getInclusionTypeColor(entity.inclusionType)}>{entity.inclusionType}</Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <div>
                <div className="font-medium">{entity.locationName}</div>
                <div>{entity.address}</div>
                <div>
                  {entity.city}, {entity.country}
                </div>
                <div className="text-xs text-gray-500">
                  {entity.lat.toFixed(4)}, {entity.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {entity.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{entity.phone}</span>
              </div>
            )}
            {entity.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{entity.email}</span>
              </div>
            )}
            {entity.website && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <a
                  href={entity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {entity.website}
                </a>
              </div>
            )}
            {entity.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(entity.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {entity.additionalParams && Object.keys(entity.additionalParams).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(entity.additionalParams).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
