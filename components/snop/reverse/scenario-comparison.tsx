"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OptimizationScenario } from "./types"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"

interface ScenarioComparisonProps {
  scenarios: OptimizationScenario[]
  currentScenarioId: string
}

export function ScenarioComparison({ scenarios, currentScenarioId }: ScenarioComparisonProps) {
  // Prepare data for cost comparison chart
  const costComparisonData = scenarios.map((scenario) => ({
    name: scenario.name,
    totalCost: scenario.model.costBreakdown.totalCost,
    recyclingCost: scenario.model.costBreakdown.recyclingFixedCost + scenario.model.costBreakdown.recyclingVariableCost,
    sortingCost:
      scenario.model.costBreakdown.storageSortingFixedCost + scenario.model.costBreakdown.storageSortingVariableCost,
    transportCost: scenario.model.costBreakdown.cpRecyclingTransportCost,
    isCurrent: scenario.id === currentScenarioId,
  }))

  // Prepare data for flow comparison chart
  const flowComparisonData = scenarios.map((scenario) => {
    // Calculate direct vs. through-sorting flows
    const directFlows = scenario.model.flows
      .filter((flow) => !flow.from.includes("regional") && !flow.to.includes("regional"))
      .reduce((sum, flow) => sum + flow.quantity, 0)

    const throughSortingFlows = scenario.model.flows
      .filter((flow) => flow.from.includes("regional") || flow.to.includes("regional"))
      .reduce((sum, flow) => sum + flow.quantity, 0)

    return {
      name: scenario.name,
      directFlow: directFlows,
      throughSortingFlow: throughSortingFlows,
      isCurrent: scenario.id === currentScenarioId,
    }
  })

  // Prepare data for radar chart
  const radarData = scenarios.map((scenario) => {
    // Calculate normalized metrics (0-100 scale)
    const costEfficiency =
      100 - (scenario.model.costBreakdown.totalCost / scenarios[0].model.costBreakdown.totalCost) * 100

    // Calculate sorting utilization
    const sortingFacility = scenario.model.facilities.find((f) => f.id === "regional-sorting")
    const sortingUtilization = sortingFacility ? (sortingFacility.collected / sortingFacility.capacity) * 100 : 0

    // Calculate recycling utilization
    const recyclingFacilities = scenario.model.facilities.filter((f) => f.type === "recycling")
    const avgRecyclingUtilization =
      recyclingFacilities.length > 0
        ? (recyclingFacilities.reduce((sum, f) => sum + f.collected / f.capacity, 0) / recyclingFacilities.length) * 100
        : 0

    // Calculate transport efficiency (inverse of transport cost percentage)
    const transportEfficiency =
      100 - (scenario.model.costBreakdown.cpRecyclingTransportCost / scenario.model.costBreakdown.totalCost) * 100

    return {
      name: scenario.name,
      "Cost Efficiency": Math.round(costEfficiency),
      "Sorting Utilization": Math.round(sortingUtilization),
      "Recycling Utilization": Math.round(avgRecyclingUtilization),
      "Transport Efficiency": Math.round(transportEfficiency),
      "Network Simplicity": Math.round(scenario.model.flows.length < 6 ? 80 : 40),
    }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Cost Comparison</CardTitle>
          <CardDescription>Compare costs across different scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Cost"]} />
                <Legend />
                <Bar dataKey="recyclingCost" name="Recycling Cost" fill="#10b981" stackId="a" />
                <Bar dataKey="sortingCost" name="Sorting Cost" fill="#3b82f6" stackId="a" />
                <Bar dataKey="transportCost" name="Transport Cost" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flow Comparison</CardTitle>
          <CardDescription>Direct vs. through-sorting flows by scenario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value} tons`} />
                <Tooltip formatter={(value: number) => [`${value} tons`, "Volume"]} />
                <Legend />
                <Bar dataKey="directFlow" name="Direct Flow" fill="#10b981" stackId="a" />
                <Bar dataKey="throughSortingFlow" name="Through Sorting" fill="#3b82f6" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Performance Radar</CardTitle>
          <CardDescription>Multi-dimensional performance comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  {Object.keys(radarData[0])
                    .filter((key) => key !== "name")
                    .map((key) => (
                      <Radar
                        key={key}
                        name={key}
                        dataKey={key}
                        stroke={
                          key === "Cost Efficiency"
                            ? "#10b981"
                            : key === "Sorting Utilization"
                              ? "#3b82f6"
                              : key === "Recycling Utilization"
                                ? "#f59e0b"
                                : key === "Transport Efficiency"
                                  ? "#ec4899"
                                  : "#8b5cf6"
                        }
                        fill={
                          key === "Cost Efficiency"
                            ? "#10b98133"
                            : key === "Sorting Utilization"
                              ? "#3b82f633"
                              : key === "Recycling Utilization"
                                ? "#f59e0b33"
                                : key === "Transport Efficiency"
                                  ? "#ec489933"
                                  : "#8b5cf633"
                        }
                        fillOpacity={0.6}
                      />
                    ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="font-medium mb-4">Scenario Details</h3>
              <div className="space-y-4">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{scenario.name}</h4>
                      {scenario.id === currentScenarioId && (
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{scenario.description}</p>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span className="font-medium">${scenario.model.costBreakdown.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recycling Facilities:</span>
                        <span className="font-medium">
                          {scenario.model.facilities.filter((f) => f.type === "recycling" && f.isOpen).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Flow:</span>
                        <span className="font-medium">{scenario.model.totalSupply} tons</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
