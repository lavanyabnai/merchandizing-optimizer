"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NetworkData } from "./types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WarehouseIcon } from "lucide-react"

interface InventoryAnalysisProps {
  networkData: NetworkData
}

export function InventoryAnalysis({ networkData }: InventoryAnalysisProps) {
  // Prepare data for central warehouse inventory chart
  const centralInventoryData = networkData.centralWarehouse.periods.map((period, index) => ({
    period: index + 1,
    beginningInventory: period.beginningInventory,
    endingInventory: period.endingInventory,
    safetyStock: networkData.centralWarehouse.safetyStock,
    periodUsage: period.periodUsage,
  }))

  // Prepare data for regional warehouses inventory charts
  const regionalInventoryData = networkData.regionalWarehouses.map((warehouse) => ({
    name: warehouse.name,
    data: warehouse.periods.map((period, index) => ({
      period: index + 1,
      beginningInventory: period.beginningInventory,
      endingInventory: period.endingInventory,
      safetyStock: warehouse.safetyStock,
      periodUsage: period.periodUsage,
    })),
  }))

  // Prepare data for combined inventory value chart
  const combinedInventoryData = Array.from({ length: 8 }, (_, i) => i + 1).map((period) => {
    const periodIndex = period - 1
    const centralInv = networkData.centralWarehouse.periods[periodIndex]?.endingInventory || 0

    const regionalInv = networkData.regionalWarehouses.reduce((sum, warehouse) => {
      return sum + (warehouse.periods[periodIndex]?.endingInventory || 0)
    }, 0)

    return {
      period,
      centralInventory: centralInv,
      regionalInventory: regionalInv,
      totalInventory: centralInv + regionalInv,
    }
  })

  // Calculate inventory metrics
  const avgCentralInventory =
    centralInventoryData.reduce((sum, data) => sum + data.endingInventory, 0) / centralInventoryData.length
  const totalRegionalAvgInventory = regionalInventoryData.reduce((sum, warehouse) => {
    const warehouseAvg = warehouse.data.reduce((wSum, data) => wSum + data.endingInventory, 0) / warehouse.data.length
    return sum + warehouseAvg
  }, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Avg Central Inventory</CardTitle>
            <CardDescription>Units per period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{avgCentralInventory.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800">Avg Regional Inventory</CardTitle>
            <CardDescription>Units per period (all regions)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalRegionalAvgInventory.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">Total Network Inventory</CardTitle>
            <CardDescription>Average across all periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {(avgCentralInventory + totalRegionalAvgInventory).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="central" className="space-y-4">
        <TabsList>
          <TabsTrigger value="central" className="flex items-center gap-2">
            <WarehouseIcon className="h-4 w-4" />
            Central Warehouse
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <WarehouseIcon className="h-4 w-4" />
            Regional Warehouses
          </TabsTrigger>
          <TabsTrigger value="combined">Combined Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="central">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Central Warehouse Inventory</CardTitle>
              <CardDescription>Visualization of inventory levels, safety stock, and period usage</CardDescription>
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
                    safetyStock: {
                      label: "Safety Stock",
                      color: "hsl(var(--chart-3))",
                    },
                    periodUsage: {
                      label: "Period Usage",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={centralInventoryData}>
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
                        dataKey="safetyStock"
                        name="Safety Stock"
                        stroke="var(--color-safetyStock)"
                        fill="var(--color-safetyStock)"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="periodUsage"
                        name="Period Usage"
                        stroke="var(--color-periodUsage)"
                        fill="var(--color-periodUsage)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-green-800">Regional Warehouses Inventory</CardTitle>
              <CardDescription>Comparison of ending inventory across regional warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer className="h-[400px] w-full"
                  config={{
                    region1: {
                      label: "Region One",
                      color: "hsl(var(--chart-5))",
                    },
                    region2: {
                      label: "Region Two",
                      color: "hsl(var(--chart-6))",
                    },
                    region3: {
                      label: "Region Three",
                      color: "hsl(var(--chart-7))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" allowDuplicatedCategory={false} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      {regionalInventoryData.map((warehouse, index) => (
                        <Line
                          key={index}
                          data={warehouse.data}
                          type="monotone"
                          dataKey="endingInventory"
                          name={warehouse.name.split(" ").pop()}
                          stroke={`var(--color-region${index + 1})`}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
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
              <CardDescription>Total inventory across the distribution network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer className="h-[400px] w-full"
                  config={{
                    centralInventory: {
                      label: "Central Inventory",
                      color: "hsl(var(--chart-1))",
                    },
                    regionalInventory: {
                      label: "Regional Inventory",
                      color: "hsl(var(--chart-5))",
                    },
                    totalInventory: {
                      label: "Total Inventory",
                      color: "hsl(var(--chart-9))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={combinedInventoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="centralInventory"
                        name="Central Inventory"
                        stroke="var(--color-centralInventory)"
                        fill="var(--color-centralInventory)"
                        fillOpacity={0.3}
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="regionalInventory"
                        name="Regional Inventory"
                        stroke="var(--color-regionalInventory)"
                        fill="var(--color-regionalInventory)"
                        fillOpacity={0.3}
                        stackId="1"
                      />
                      <Line
                        type="monotone"
                        dataKey="totalInventory"
                        name="Total Inventory"
                        stroke="var(--color-totalInventory)"
                        strokeWidth={3}
                      />
                    </AreaChart>
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
