"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MrpState } from "@/components/snop/mrp/types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BoxIcon, PackageIcon } from "lucide-react"

interface InventoryAnalysisProps {
  mrpState: MrpState
}

export function InventoryAnalysis({ mrpState }: InventoryAnalysisProps) {
  // Prepare data for end item inventory chart
  const endItemInventoryData = mrpState.periods.map((period, index) => ({
    period,
    beginningInventory: mrpState.endItem.beginningInventory[index],
    endingInventory: mrpState.endItem.endingInventory[index],
    dueIn: mrpState.endItem.dueIn[index],
    grossRequirements: mrpState.endItem.grossRequirements[index],
  }))

  // Prepare data for component inventory chart
  const componentInventoryData = mrpState.periods.map((period, index) => ({
    period,
    beginningInventory: mrpState.component.beginningInventory[index],
    endingInventory: mrpState.component.endingInventory[index],
    dueIn: mrpState.component.dueIn[index],
    grossRequirements: mrpState.component.grossRequirements[index],
  }))

  // Prepare data for combined inventory value chart
  const inventoryValueData = mrpState.periods.map((period, index) => ({
    period,
    endItemValue: mrpState.endItem.endingInventory[index],
    componentValue:
      mrpState.component.endingInventory[index] * (mrpState.component.holdingCost / mrpState.endItem.holdingCost),
    totalValue:
      mrpState.endItem.endingInventory[index] +
      mrpState.component.endingInventory[index] * (mrpState.component.holdingCost / mrpState.endItem.holdingCost),
  }))

  // Calculate inventory metrics
  const avgEndItemInventory = mrpState.endItem.endingInventory.reduce((sum, inv) => sum + inv, 0) / 12
  const avgComponentInventory = mrpState.component.endingInventory.reduce((sum, inv) => sum + inv, 0) / 12
  const maxEndItemInventory = Math.max(...mrpState.endItem.endingInventory)
  const maxComponentInventory = Math.max(...mrpState.component.endingInventory)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Avg End Item Inventory</CardTitle>
            <CardDescription>Units per period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{avgEndItemInventory.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800">Avg Component Inventory</CardTitle>
            <CardDescription>Units per period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{avgComponentInventory.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Max End Item Inventory</CardTitle>
            <CardDescription>Peak inventory level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{maxEndItemInventory}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800">Max Component Inventory</CardTitle>
            <CardDescription>Peak inventory level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{maxComponentInventory}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endItem" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endItem" className="flex items-center gap-2">
            <BoxIcon className="h-4 w-4" />
            End Item Inventory
          </TabsTrigger>
          <TabsTrigger value="component" className="flex items-center gap-2">
            <PackageIcon className="h-4 w-4" />
            Component Inventory
          </TabsTrigger>
          <TabsTrigger value="combined">Combined Inventory Value</TabsTrigger>
        </TabsList>

        <TabsContent value="endItem">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">End Item Inventory Flow</CardTitle>
              <CardDescription>Visualization of inventory levels, demand, and production</CardDescription>
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
                    dueIn: {
                      label: "Due In (Production)",
                      color: "hsl(var(--chart-3))",
                    },
                    grossRequirements: {
                      label: "Gross Requirements",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={endItemInventoryData}>
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
                        dataKey="dueIn"
                        name="Due In (Production)"
                        stroke="var(--color-dueIn)"
                        fill="var(--color-dueIn)"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="grossRequirements"
                        name="Gross Requirements"
                        stroke="var(--color-grossRequirements)"
                        fill="var(--color-grossRequirements)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="component">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-green-800">Component Inventory Flow</CardTitle>
              <CardDescription>Visualization of inventory levels, demand, and production</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer className="h-[400px] w-full"
                  config={{
                    beginningInventory: {
                      label: "Beginning Inventory",
                      color: "hsl(var(--chart-5))",
                    },
                    endingInventory: {
                      label: "Ending Inventory",
                      color: "hsl(var(--chart-6))",
                    },
                    dueIn: {
                      label: "Due In (Production)",
                      color: "hsl(var(--chart-7))",
                    },
                    grossRequirements: {
                      label: "Gross Requirements",
                      color: "hsl(var(--chart-8))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={componentInventoryData}>
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
                        dataKey="dueIn"
                        name="Due In (Production)"
                        stroke="var(--color-dueIn)"
                        fill="var(--color-dueIn)"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="grossRequirements"
                        name="Gross Requirements"
                        stroke="var(--color-grossRequirements)"
                        fill="var(--color-grossRequirements)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combined">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-purple-800">Combined Inventory Value</CardTitle>
              <CardDescription>Total inventory value across the supply chain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer className="h-[400px] w-full"
                  config={{
                    endItemValue: {
                      label: "End Item Value",
                      color: "hsl(var(--chart-1))",
                    },
                    componentValue: {
                      label: "Component Value",
                      color: "hsl(var(--chart-5))",
                    },
                    totalValue: {
                      label: "Total Value",
                      color: "hsl(var(--chart-9))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={inventoryValueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="endItemValue"
                        name="End Item Value"
                        stroke="var(--color-endItemValue)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="componentValue"
                        name="Component Value"
                        stroke="var(--color-componentValue)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalValue"
                        name="Total Value"
                        stroke="var(--color-totalValue)"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
