"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlayIcon,
  DownloadIcon,
  UploadIcon,
  SettingsIcon,
  BarChart3Icon,
  RecycleIcon,
  ContrastIcon as CompareIcon,
  FileLineChartIcon as FlowChartIcon,
} from "lucide-react"
import { initialScenarios } from "./initial-data"
import type { OptimizationScenario } from "./types"
import { DashboardHeader } from "./dashboard-header"
import { CostBreakdown } from "./cost-breakdown"
import { FacilityAnalysis } from "./facility-analysis"
import { ScenarioComparison } from "./scenario-comparison"
import { SupplyChainFlow } from "./supply-chain-flow"

export function ReverseLogisticsDashboard() {
  const [scenarios] = useState<OptimizationScenario[]>(initialScenarios)
  const [currentScenarioId, setCurrentScenarioId] = useState<string>("scenario-1")
  const [isOptimizing, setIsOptimizing] = useState(false)

  const currentScenario = scenarios.find((s) => s.id === currentScenarioId) || scenarios[0]

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
      <DashboardHeader model={currentScenario.model} scenarioName={currentScenario.name} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Scenario:</span>
          <Select value={currentScenarioId} onValueChange={setCurrentScenarioId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a scenario" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            Model Settings
          </Button>
          <Button variant="outline" className="gap-2">
            <UploadIcon className="h-4 w-4" />
            Import Data
          </Button>
          <Button variant="outline" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export Results
          </Button>
          <Button onClick={handleOptimize} disabled={isOptimizing} className="gap-2 bg-green-600 hover:bg-green-700">
            <PlayIcon className="h-4 w-4" />
            {isOptimizing ? "Optimizing..." : "Run Optimization"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="supply-chain" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="supply-chain" className="flex items-center gap-2">
            <FlowChartIcon className="h-4 w-4" />
            Supply Chain Flow
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger value="facilities" className="flex items-center gap-2">
            <RecycleIcon className="h-4 w-4" />
            Facility Analysis
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <CompareIcon className="h-4 w-4" />
            Scenario Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supply-chain" className="space-y-4">
          <SupplyChainFlow model={currentScenario.model} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <CostBreakdown model={currentScenario.model} />
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <FacilityAnalysis model={currentScenario.model} />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <ScenarioComparison scenarios={scenarios} currentScenarioId={currentScenarioId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
