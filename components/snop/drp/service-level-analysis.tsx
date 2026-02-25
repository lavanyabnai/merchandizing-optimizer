"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NetworkData, WarehouseKpis } from "./types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ServiceLevelAnalysisProps {
  networkData: NetworkData
  kpis: WarehouseKpis
}

export function ServiceLevelAnalysis({ networkData, kpis }: ServiceLevelAnalysisProps) {
  // Prepare data for service level comparison chart
  const serviceLevelData = Object.entries(kpis).map(([name, data]) => ({
    name: name.includes("Central") ? "Central" : name.split(" ").pop(),
    serviceLevel: data.serviceLevel,
    inventoryTurnover: data.inventoryTurnover,
    stockoutPeriods: data.stockoutPeriods,
  }))

  // Prepare data for radar chart
  const radarData = Object.entries(kpis).map(([name, data]) => ({
    name: name.includes("Central") ? "Central" : name.split(" ").pop(),
    "Service Level": (data.serviceLevel / 100) * 5, // Scale to 0-5
    "Inventory Turnover": data.inventoryTurnover,
    "Order Frequency": (data.orderFrequency / 100) * 5, // Scale to 0-5
    "Stockout Risk": 5 - data.stockoutPeriods, // Inverse scale (higher is better)
  }))

  // Calculate potential stockout periods
  const stockoutRiskData = networkData.regionalWarehouses.map((warehouse) => {
    const periodsWithLowInventory = warehouse.periods.filter(
      (period) => period.endingInventory <= warehouse.safetyStock * 0.5,
    ).length

    return {
      name: warehouse.name.split(" ").pop(),
      lowInventoryPeriods: periodsWithLowInventory,
      safetyStock: warehouse.safetyStock,
      orderQuantity: warehouse.orderQuantity,
      leadTime: warehouse.leadTime,
      riskScore: periodsWithLowInventory > 0 ? 100 - (periodsWithLowInventory / 8) * 100 : 100,
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Service Level Comparison</CardTitle>
            <CardDescription>Service level performance across warehouses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer className="h-[300px] w-full"
                config={{
                  serviceLevel: {
                    label: "Service Level (%)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceLevelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[90, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="serviceLevel" name="Service Level (%)" fill="var(--color-serviceLevel)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Warehouse Performance</CardTitle>
            <CardDescription>Multi-dimensional performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar
                    name="Service Level"
                    dataKey="Service Level"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Inventory Turnover"
                    dataKey="Inventory Turnover"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Order Frequency"
                    dataKey="Order Frequency"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Stockout Risk"
                    dataKey="Stockout Risk"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Stockout Risk Analysis</CardTitle>
          <CardDescription>Assessment of potential stockout risks and safety stock effectiveness</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Safety Stock</TableHead>
                <TableHead>Order Quantity</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Low Inventory Periods</TableHead>
                <TableHead>Risk Assessment</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockoutRiskData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{data.name}</TableCell>
                  <TableCell>{data.safetyStock} units</TableCell>
                  <TableCell>{data.orderQuantity} units</TableCell>
                  <TableCell>{data.leadTime} weeks</TableCell>
                  <TableCell>{data.lowInventoryPeriods} of 8</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        data.riskScore > 90
                          ? "bg-green-100 text-green-800 border-green-300"
                          : data.riskScore > 75
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-red-100 text-red-800 border-red-300"
                      }`}
                    >
                      {data.riskScore > 90 ? "Low Risk" : data.riskScore > 75 ? "Medium Risk" : "High Risk"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {data.lowInventoryPeriods > 2
                      ? "Increase safety stock"
                      : data.lowInventoryPeriods > 0
                        ? "Monitor closely"
                        : "Current levels adequate"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
