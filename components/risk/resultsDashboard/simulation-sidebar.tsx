"use client"

import { CircleDot, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimulationSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export default function SimulationSidebar({ activeView, onViewChange }: SimulationSidebarProps) {
  const menuItems = [
    { id: "profit-loss", label: "Profit and Loss Statement" },
    { id: "service-level", label: "Service Level" },
    { id: "lead-time", label: "Lead Time" },
    { id: "inventory", label: "Available Inventory" },
    { id: "fulfillment", label: "Fulfillment" },
  ]

  return (
    <div className="w-64 border-r bg-white flex flex-col">
      <div className="py-2">
        {menuItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <div key={item.id} className="relative px-2 py-1">
              <Button
                onClick={() => onViewChange(item.id)}
                variant={isActive ? "ghost" : "ghost"}
                className={`w-full justify-start gap-2 px-3 py-2 h-auto ${
                  isActive ? "bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700" : "text-gray-600"
                }`}
              >
                <CircleDot
                  className={`h-4 w-4 ${isActive ? "text-orange-600 fill-orange-100" : "text-gray-300 fill-gray-100"}`}
                />
                <span>{item.label}</span>
              </Button>

              {isActive && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
