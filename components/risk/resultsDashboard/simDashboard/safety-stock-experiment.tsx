"use client"

import { useState } from "react"
import SafetyStockSidebar from "@/components/risk/resultsDashboard/simDashboard/safety-stock-sidebar"
import SafetyStockDashboard from "@/components/risk/resultsDashboard/simDashboard/safety-stock-dashboard"

export default function SafetyStockExperiment() {
  const [activeView, setActiveView] = useState("overview")

  const handleViewChange = (view: string) => {
    setActiveView(view)
  }

  return (
    <div className="flex h-full">
      <SafetyStockSidebar activeView={activeView} onViewChange={handleViewChange} />
      <div className="flex-1 p-4 overflow-auto">
        <SafetyStockDashboard />
      </div>
    </div>
  )
}
