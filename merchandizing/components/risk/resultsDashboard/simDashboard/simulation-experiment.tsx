"use client"

import { useState } from "react"
import SimulationSidebar from "@/components/risk/resultsDashboard/simulation-sidebar"
import FinancialMetrics from "@/components/risk/resultsDashboard/simDashboard/simulation/financial-metrics"
import ProfitLossView from "@/components/risk/resultsDashboard/simDashboard/simulation/profit-loss-view"
import ServiceLevelView from "@/components/risk/resultsDashboard/simDashboard/simulation/service-level-view"
import LeadTimeView from "@/components/risk/resultsDashboard/simDashboard/simulation/lead-time-view"
import InventoryView from "@/components/risk/resultsDashboard/simDashboard/simulation/inventory-view"
import FulfillmentView from "@/components/risk/resultsDashboard/simDashboard/simulation/fulfillment-view"

export default function SimulationExperiment() {
  const [activeView, setActiveView] = useState("profit-loss")

  const handleViewChange = (view: string) => {
    setActiveView(view)
  }

  return (
    <div className="flex h-full">
      <SimulationSidebar activeView={activeView} onViewChange={handleViewChange} />
      <div className="flex-1 p-4 overflow-auto">
        <FinancialMetrics />

        {activeView === "profit-loss" && <ProfitLossView />}
        {activeView === "service-level" && <ServiceLevelView />}
        {activeView === "lead-time" && <LeadTimeView />}
        {activeView === "inventory" && <InventoryView />}
        {activeView === "fulfillment" && <FulfillmentView />}
      </div>
    </div>
  )
}
