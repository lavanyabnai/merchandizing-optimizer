"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReverseLogisticsModel } from "./types"
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface FacilityAnalysisProps {
  model: ReverseLogisticsModel
}

export function FacilityAnalysis({ model }: FacilityAnalysisProps) {
  // Filter out collection points
  const facilities = model.facilities.filter((f) => f.id !== "cp-1" && f.id !== "cp-2" && f.id !== "cp-3")

  // Prepare data for capacity utilization chart
  const capacityData = facilities.map((facility) => ({
    name: facility.name,
    capacity: facility.capacity,
    utilized: facility.collected,
    utilization: ((facility.collected / facility.capacity) * 100).toFixed(1),
    color: facility.type === "recycling" ? "#10b981" : "#3b82f6",
  }))

  // Prepare data for cost comparison chart
  const costData = facilities.map((facility) => ({
    name: facility.name,
    fixedCost: facility.fixedCost,
    variableCost: facility.varCost * facility.collected,
    totalCost: facility.fixedCost + facility.varCost * facility.collected,
    costPerTon: ((facility.fixedCost + facility.varCost * facility.collected) / facility.collected).toFixed(2),
    color: facility.type === "recycling" ? "#10b981" : "#3b82f6",
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Facility Capacity Utilization</CardTitle>
          <CardDescription>Current utilization of facility capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value} tons`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "capacity"
                      ? `${value} tons`
                      : `${value} tons (${capacityData.find((d) => d.capacity === value)?.utilization || 0}%)`,
                    name === "capacity" ? "Total Capacity" : "Utilized Capacity",
                  ]}
                />
                <Legend />
                <Bar dataKey="capacity" name="Total Capacity" fill="#e5e7eb" />
                <Bar dataKey="utilized" name="Utilized Capacity">
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facility Cost Analysis</CardTitle>
          <CardDescription>Fixed and variable costs by facility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Cost"]} />
                <Legend />
                <Bar dataKey="fixedCost" name="Fixed Cost" fill="#3b82f6" stackId="a" />
                <Bar dataKey="variableCost" name="Variable Cost" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Facility Performance</CardTitle>
          <CardDescription>Detailed performance metrics for each facility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {facilities.map((facility) => (
              <div key={facility.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-medium text-lg">{facility.name}</h3>
                    <p className="text-sm text-gray-500">
                      {facility.type === "recycling" ? "Recycling Facility" : "Regional Storage/Sorting"}
                    </p>
                  </div>
                  <Badge
                    className={
                      facility.type === "recycling" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }
                  >
                    {facility.isOpen ? "OPEN" : "CLOSED"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Capacity Utilization</p>
                    <div className="flex items-center gap-2">
                      <Progress value={(facility.collected / facility.capacity) * 100} className="h-2" />
                      <span className="text-sm">{((facility.collected / facility.capacity) * 100).toFixed(1)}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {facility.collected} of {facility.capacity} tons
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Cost Breakdown</p>
                    <div className="flex gap-2 text-sm">
                      <div className="bg-blue-50 px-2 py-1 rounded">Fixed: ${facility.fixedCost}</div>
                      <div className="bg-amber-50 px-2 py-1 rounded">
                        Variable: ${(facility.varCost * facility.collected).toFixed(2)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Variable rate: ${facility.varCost}/ton</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Cost Efficiency</p>
                    <p className="text-lg font-medium">
                      ${((facility.fixedCost + facility.varCost * facility.collected) / facility.collected).toFixed(2)}
                      /ton
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total: ${(facility.fixedCost + facility.varCost * facility.collected).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  <span className="font-medium">Connected to: </span>
                  {model.flows
                    .filter((flow) => flow.from === facility.id || flow.to === facility.id)
                    .map((flow) => {
                      const connectedFacility = model.facilities.find(
                        (f) => f.id === (flow.from === facility.id ? flow.to : flow.from),
                      )
                      return connectedFacility?.name
                    })
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .join(", ")}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
