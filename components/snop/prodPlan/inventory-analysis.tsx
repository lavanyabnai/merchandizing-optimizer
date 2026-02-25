"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ModelState } from "@/lib/types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Badge } from "@/components/ui/badge"

interface InventoryAnalysisProps {
  modelState: ModelState
}

export function InventoryAnalysis({ modelState }: InventoryAnalysisProps) {
  const inventoryData = modelState.periods.map((period, index) => ({
    period,
    beginningInventory: modelState.beginningInventory[index],
    endingInventory: modelState.endingInventory[index],
    demand: modelState.demand[index],
    production: modelState.quantityToMake[index],
  }))

  const inventoryTurnoverData = modelState.periods.map((period, index) => {
    const avgInventory = (modelState.beginningInventory[index] + modelState.endingInventory[index]) / 2
    const turnover = avgInventory > 0 ? modelState.demand[index] / avgInventory : 0

    return {
      period,
      turnover,
    }
  })

  const totalProduction = modelState.quantityToMake.reduce((sum, qty) => sum + qty, 0)
  const totalDemand = modelState.demand.reduce((sum, demand) => sum + demand, 0)
  const avgInventory = modelState.endingInventory.reduce((sum, inv) => sum + inv, 0) / modelState.periods.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Total Production</CardTitle>
            <CardDescription>Sum of all production quantities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{totalProduction} units</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Total Demand</CardTitle>
            <CardDescription>Sum of all period demands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalDemand} units</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Average Inventory</CardTitle>
            <CardDescription>Average ending inventory level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{avgInventory.toFixed(1)} units</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-blue-800">Inventory Flow Analysis</CardTitle>
              <CardDescription>Visualization of inventory levels, demand, and production</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Beginning Inventory
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Ending Inventory
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ChartContainer className="h-[400px] w-full"
              config={{
                beginningInventory: {
                  label: "Beginning Inventory",
                  color: "hsl(var(--chart-1))",
                },
                endingInventory: {
                  label: "Ending Inventory",
                  color: "hsl(var(--chart-2))",
                },
                demand: {
                  label: "Demand",
                  color: "hsl(var(--chart-3))",
                },
                production: {
                  label: "Production",
                  color: "hsl(var(--chart-4))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="beginningInventory"
                    name="Beginning Inventory"
                    stroke="var(--color-beginningInventory)"
                    fill="var(--color-beginningInventory)"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="endingInventory"
                    name="Ending Inventory"
                    stroke="var(--color-endingInventory)"
                    fill="var(--color-endingInventory)"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    name="Demand"
                    stroke="var(--color-demand)"
                    fill="var(--color-demand)"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="production"
                    name="Production"
                    stroke="var(--color-production)"
                    fill="var(--color-production)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Inventory Turnover Ratio</CardTitle>
          <CardDescription>Measures how efficiently inventory is managed (Demand/Average Inventory)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer className="h-[300px] w-full"
              config={{
                turnover: {
                  label: "Turnover Ratio",
                  color: "hsl(var(--chart-5))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryTurnoverData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="turnover" name="Turnover Ratio" fill="var(--color-turnover)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
