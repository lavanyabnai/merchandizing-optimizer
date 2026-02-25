"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelInputs } from "@/components/snop/mrp/model-inputs"
import { OptimizationResults } from "@/components/snop/mrp/optimization-results"
import { InventoryAnalysis } from "@/components/snop/mrp/inventory-analysis"
import { ProductionSchedule } from "@/components/snop/mrp/production-schedule"
import { SupplyChainVisualization } from "@/components/snop/mrp/supply-chain-visualization"
import { DashboardHeader } from "@/components/snop/mrp/dashboard-header"
import { Button } from "@/components/ui/button"
import { PlayIcon, DownloadIcon, UploadIcon, SettingsIcon } from "lucide-react"
import { initialMrpState } from "@/components/snop/mrp/initial-data"
import type { MrpState } from "@/components/snop/mrp/types"
  import { CostSummary } from "@/components/snop/mrp/cost-summary"

export function MrpDashboard() {
  const [mrpState, setMrpState] = useState<MrpState>(initialMrpState)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimize = () => {
    setIsOptimizing(true)
    // In a real application, this would call an optimization service
    setTimeout(() => {
      // Simulate optimization results - in a real app this would come from a solver
      const optimizedState = { ...mrpState }

      // Update the decision variables (Due In quantities)
      optimizedState.endItem.dueIn = [0, 0, 0, 0, 0, 80, 50, 200, 100, 0, 220, 0]
      optimizedState.component.dueIn = [0, 0, 0, 300, 300, 300, 300, 300, 300, 0, 0, 0]

      // Update planned order release based on lead time
      for (let i = 0; i < 12; i++) {
        const releaseIndex = i - optimizedState.endItem.leadTime
        if (releaseIndex >= 0) {
          optimizedState.endItem.plannedOrderRelease[releaseIndex] = optimizedState.endItem.dueIn[i]
        }
      }

      // Calculate component gross requirements based on end item planned order release
      for (let i = 0; i < 12; i++) {
        optimizedState.component.grossRequirements[i] =
          optimizedState.endItem.plannedOrderRelease[i] * optimizedState.component.qtyPerEndItem
      }

      // Update component planned order release based on lead time
      for (let i = 0; i < 12; i++) {
        const releaseIndex = i - optimizedState.component.leadTime
        if (releaseIndex >= 0) {
          optimizedState.component.plannedOrderRelease[releaseIndex] = optimizedState.component.dueIn[i]
        }
      }

      // Calculate ending inventory for end items
      for (let i = 0; i < 12; i++) {
        const prevEndInv =
          i > 0 ? optimizedState.endItem.endingInventory[i - 1] : optimizedState.endItem.beginningInventory[0]
        optimizedState.endItem.endingInventory[i] =
          prevEndInv + optimizedState.endItem.dueIn[i] - optimizedState.endItem.grossRequirements[i]

        const compPrevEndInv =
          i > 0 ? optimizedState.component.endingInventory[i - 1] : optimizedState.component.beginningInventory[0]
        optimizedState.component.endingInventory[i] =
          compPrevEndInv + optimizedState.component.dueIn[i] - optimizedState.component.grossRequirements[i]
      }

      // Calculate costs
      let endItemSetupCost = 0
      let endItemHoldingCost = 0
      let componentSetupCost = 0
      let componentHoldingCost = 0

      for (let i = 0; i < 12; i++) {
        if (optimizedState.endItem.dueIn[i] > 0) {
          endItemSetupCost += optimizedState.endItem.setupCost
        }
        endItemHoldingCost += optimizedState.endItem.endingInventory[i] * optimizedState.endItem.holdingCost

        if (optimizedState.component.dueIn[i] > 0) {
          componentSetupCost += optimizedState.component.setupCost
        }
        componentHoldingCost += optimizedState.component.endingInventory[i] * optimizedState.component.holdingCost
      }

      optimizedState.endItem.totalCost = endItemSetupCost + endItemHoldingCost
      optimizedState.component.totalCost = componentSetupCost + componentHoldingCost
      optimizedState.totalSystemCost = optimizedState.endItem.totalCost + optimizedState.component.totalCost

      setMrpState(optimizedState)
      setIsOptimizing(false)
    }, 2000)
  }

  const handleInputChange = (newState: Partial<MrpState>) => {
    setMrpState((prev) => ({ ...prev, ...newState }))
  }

  return (
    <div className="m-4">
      <DashboardHeader
        totalCost={mrpState.totalSystemCost}
        endItemCost={mrpState.endItem.totalCost}
        componentCost={mrpState.component.totalCost}
      />

      <div className="flex justify-end gap-4 mb-6">
        <Button variant="outline" className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          Solver Settings
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

      <Tabs defaultValue="inputs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="inputs">Model Inputs</TabsTrigger>
          <TabsTrigger value="results">Optimization Results</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
          <TabsTrigger value="schedule">Production Schedule</TabsTrigger>
          <TabsTrigger value="supplychain">Supply Chain View</TabsTrigger>
        </TabsList>

        <TabsContent value="inputs" className="space-y-4">
          <ModelInputs mrpState={mrpState} onInputChange={handleInputChange} />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <OptimizationResults mrpState={mrpState} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <CostSummary mrpState={mrpState} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryAnalysis mrpState={mrpState} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ProductionSchedule mrpState={mrpState} />
        </TabsContent>

        <TabsContent value="supplychain" className="space-y-4">
          <SupplyChainVisualization mrpState={mrpState} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
