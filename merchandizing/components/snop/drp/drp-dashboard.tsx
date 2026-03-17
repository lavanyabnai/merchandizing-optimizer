"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlayIcon, DownloadIcon, UploadIcon, SettingsIcon } from "lucide-react"
import { initialNetworkData } from "./initial-data"
import { initialKpis } from "./initial-data"
import type { NetworkData, WarehouseKpis } from "./types"
import { DashboardHeader } from "@/components/snop/drp/dashboard-header"
import { NetworkView } from "@/components/snop/drp/network-view"
import { WarehousePlanning } from "@/components/snop/drp/warehouse-planning"
import { InventoryAnalysis } from "@/components/snop/drp/inventory-analysis"
import { OrderAnalysis } from "@/components/snop/drp/order-analysis"
import { ServiceLevelAnalysis } from "@/components/snop/drp/service-level-analysis"

export function DrpDashboard() {
  const [networkData] = useState<NetworkData>(initialNetworkData)
  const [kpis] = useState<WarehouseKpis>(initialKpis)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimize = () => {
    setIsOptimizing(true)
    // In a real application, this would call an optimization service
    setTimeout(() => {
      // Simulate optimization results - in a real app this would come from a solver
      setIsOptimizing(false)
    }, 2000)
  }

  return (
    <div className="m-4">
      <DashboardHeader kpis={kpis} />

      <div className="flex justify-end gap-4 mb-6">
        <Button variant="outline" className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          DRP Settings
        </Button>
        <Button variant="outline" className="gap-2">
          <UploadIcon className="h-4 w-4" />
          Import Data
        </Button>
        <Button variant="outline" className="gap-2">
          <DownloadIcon className="h-4 w-4" />
          Export Results
        </Button>
        <Button onClick={handleOptimize} disabled={isOptimizing} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <PlayIcon className="h-4 w-4" />
          {isOptimizing ? "Optimizing..." : "Run Optimization"}
        </Button>
      </div>

      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="network">Network View</TabsTrigger>
          <TabsTrigger value="planning">Warehouse Planning</TabsTrigger>
          <TabsTrigger value="orders">Order Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
          <TabsTrigger value="service">Service Level</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <NetworkView networkData={networkData} />
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <WarehousePlanning networkData={networkData} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrderAnalysis networkData={networkData} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryAnalysis networkData={networkData} />
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <ServiceLevelAnalysis networkData={networkData} kpis={kpis} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
