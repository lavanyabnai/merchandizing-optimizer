"use client"

import type { ReverseLogisticsModel } from "./types"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DashboardHeaderProps {
  model: ReverseLogisticsModel
  scenarioName: string
}

export function DashboardHeader({ model, scenarioName }: DashboardHeaderProps) {
  // Calculate key metrics
  const totalCost = model.costBreakdown.totalCost
  const costPerTon = totalCost / model.totalSupply

  // Calculate recycling facility utilization
  const recyclingFacilities = model.facilities.filter((f) => f.type === "recycling")
  const totalRecyclingCapacity = recyclingFacilities.reduce((sum, f) => sum + f.capacity, 0)
  const totalRecyclingUtilized = recyclingFacilities.reduce((sum, f) => sum + f.collected, 0)
  const recyclingUtilization = (totalRecyclingUtilized / totalRecyclingCapacity) * 100

  // Calculate sorting facility utilization

  // Calculate direct vs. through-sorting percentages
  const directFlows = model.flows
    .filter((flow) => !flow.from.includes("regional") && !flow.to.includes("regional"))
    .reduce((sum, flow) => sum + flow.quantity, 0)

  const throughSortingFlows = model.flows
    .filter((flow) => flow.from.includes("regional") || flow.to.includes("regional"))
    .reduce((sum, flow) => sum + flow.quantity, 0)

  const directPercentage = (directFlows / model.totalSupply) * 100
  const throughSortingPercentage = (throughSortingFlows / model.totalSupply) * 100

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-green-800 mb-2">Battery Recycling Network Optimization</h1>
      <p className="text-gray-500 mb-6">Scenario: {scenarioName}</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Total Cost</div>
            <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
            <div className="text-sm text-gray-500">${costPerTon.toFixed(2)} per ton</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Total Supply</div>
            <div className="text-2xl font-bold">{model.totalSupply.toLocaleString()} tons</div>
            <div className="text-sm text-gray-500">
              From {model.facilities.filter((f) => f.id.startsWith("cp-")).length} collection points
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Recycling Utilization</div>
            <div className="flex items-center gap-2">
              <Progress value={recyclingUtilization} className="h-2" />
              <span className="text-sm">{recyclingUtilization.toFixed(1)}%</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {totalRecyclingUtilized} of {totalRecyclingCapacity} tons capacity
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Flow Distribution</div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <div className="text-xs text-blue-600">Through Sorting</div>
                <div className="text-lg font-medium">{throughSortingPercentage.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-green-600">Direct to Recycling</div>
                <div className="text-lg font-medium">{directPercentage.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
