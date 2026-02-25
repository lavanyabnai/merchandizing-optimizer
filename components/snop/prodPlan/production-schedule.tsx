"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ModelState } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

interface ProductionScheduleProps {
  modelState: ModelState
}

export function ProductionSchedule({ modelState }: ProductionScheduleProps) {
  const productionData = modelState.periods.map((period, index) => ({
    period,
    production: modelState.quantityToMake[index],
    capacity: modelState.capacity,
    utilization:
      modelState.quantityToMake[index] > 0 ? (modelState.quantityToMake[index] / modelState.capacity) * 100 : 0,
  }))

  const totalProduction = modelState.quantityToMake.reduce((sum, qty) => sum + qty, 0)
  const productionPeriods = modelState.quantityToMake.filter((qty) => qty > 0).length
  const avgBatchSize = productionPeriods > 0 ? totalProduction / productionPeriods : 0
  const avgUtilization =
    productionPeriods > 0
      ? modelState.quantityToMake.reduce((sum, qty) => sum + (qty > 0 ? (qty / modelState.capacity) * 100 : 0), 0) /
        productionPeriods
      : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Production Periods</CardTitle>
            <CardDescription>Number of periods with production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {productionPeriods} of {modelState.periods.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Average Batch Size</CardTitle>
            <CardDescription>Average production quantity per batch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{avgBatchSize.toFixed(0)} units</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Avg Capacity Utilization</CardTitle>
            <CardDescription>Average utilization when producing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{avgUtilization.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-blue-800">Production Schedule</CardTitle>
              <CardDescription>Detailed view of production quantities by period</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Production Period
              </Badge>
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                No Production
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  {modelState.periods.map((period) => (
                    <TableHead key={period} className="text-center">
                      {period}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Production Quantity</TableCell>
                  {modelState.quantityToMake.map((qty, index) => (
                    <TableCell
                      key={index}
                      className={`text-center font-medium ${qty > 0 ? "bg-yellow-50" : "bg-gray-50"}`}
                    >
                      {qty}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Setup</TableCell>
                  {modelState.orderSetup.map((setup, index) => (
                    <TableCell key={index} className={`text-center ${setup > 0 ? "bg-yellow-50" : "bg-gray-50"}`}>
                      {setup > 0 ? "Yes" : "No"}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Capacity Utilization</TableCell>
                  {productionData.map((data, index) => (
                    <TableCell
                      key={index}
                      className={`text-center ${data.production > 0 ? "bg-yellow-50" : "bg-gray-50"}`}
                    >
                      {data.production > 0 ? `${data.utilization.toFixed(1)}%` : "0%"}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Production and Capacity Utilization</CardTitle>
          <CardDescription>Visual representation of production quantities and capacity utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ChartContainer className="h-[400px] w-full"
              config={{
                production: {
                  label: "Production Quantity",
                  color: "hsl(var(--chart-1))",
                },
                capacity: {
                  label: "Capacity",
                  color: "hsl(var(--chart-2))",
                },
                utilization: {
                  label: "Utilization %",
                  color: "hsl(var(--chart-3))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="production" name="Production Quantity" fill="var(--color-production)" />
                  <Bar
                    yAxisId="left"
                    dataKey="capacity"
                    name="Capacity"
                    fill="var(--color-capacity)"
                    fillOpacity={0.3}
                  />
                  <Bar yAxisId="right" dataKey="utilization" name="Utilization %" fill="var(--color-utilization)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
