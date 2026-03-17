"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelInputs } from "@/components/snop/prodPlan/model-inputs"
import { ModelResults } from "@/components/snop/prodPlan/model-results"
import { CostAnalysis } from "@/components/snop/prodPlan/cost-analysis"
import { InventoryAnalysis } from "@/components/snop/prodPlan/inventory-analysis"
import { ProductionSchedule } from "@/components/snop/prodPlan/production-schedule"
import { DashboardHeader } from "@/components/snop/prodPlan/dashboard-header"
import { Button } from "@/components/ui/button"
import { PlayIcon, DownloadIcon, UploadIcon } from "lucide-react"
import { initialModelState } from "@/lib/initial-data"
import type { ModelState } from "@/lib/types"

export function SupplyChainDashboard() {
  const [modelState, setModelState] = useState<ModelState>(initialModelState)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimize = () => {
    setIsOptimizing(true)
    // In a real application, this would call an optimization service
    setTimeout(() => {
      // Simulate optimization results
      const optimizedState = { ...modelState }

      // Update quantity to make (decision variables)
      optimizedState.quantityToMake = [550, 0, 0, 0, 0, 450, 0, 0, 450, 0, 550, 0]

      // Update order setup (decision variables)
      optimizedState.orderSetup = [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0]

      // Calculate ending inventory
      optimizedState.endingInventory = optimizedState.periods.map((_, index) => {
        const prevEndInv = index > 0 ? optimizedState.endingInventory[index - 1] : optimizedState.beginningInventory[0]
        return prevEndInv + optimizedState.quantityToMake[index] - optimizedState.demand[index]
      })

      // Calculate costs
      optimizedState.setupCost = optimizedState.orderSetup.map((setup) =>
        setup === 1 ? optimizedState.setupCostPerRun : 0,
      )

      optimizedState.holdingCost = optimizedState.endingInventory.map(
        (inv) => inv * optimizedState.holdingCostPerItemMonth,
      )

      optimizedState.totalCost = optimizedState.periods.map(
        (_, index) => optimizedState.setupCost[index] + optimizedState.holdingCost[index],
      )

      setModelState(optimizedState)
      setIsOptimizing(false)
    }, 2000)
  }

  const handleInputChange = (newState: Partial<ModelState>) => {
    setModelState((prev) => ({ ...prev, ...newState }))
  }

  return (
    <div className="m-4 py-6">
      <DashboardHeader />

      <div className="flex justify-end gap-4 mb-6">
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inputs">Model Inputs</TabsTrigger>
          <TabsTrigger value="results">Optimization Results</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
          <TabsTrigger value="schedule">Production Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="inputs" className="space-y-4">
          <ModelInputs modelState={modelState} onInputChange={handleInputChange} />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <ModelResults modelState={modelState} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <CostAnalysis modelState={modelState} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryAnalysis modelState={modelState} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ProductionSchedule modelState={modelState} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
