"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MrpState } from "@/components/snop/mrp/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BoxIcon, PackageIcon } from "lucide-react"

interface ProductionScheduleProps {
  mrpState: MrpState
}

export function ProductionSchedule({ mrpState }: ProductionScheduleProps) {
  // Prepare data for end item production chart
  const endItemProductionData = mrpState.periods.map((period, index) => ({
    period,
    production: mrpState.endItem.dueIn[index],
    capacity: mrpState.endItem.capacity,
    utilization:
      mrpState.endItem.dueIn[index] > 0 ? (mrpState.endItem.dueIn[index] / mrpState.endItem.capacity) * 100 : 0,
  }))

  // Prepare data for component production chart
  const componentProductionData = mrpState.periods.map((period, index) => ({
    period,
    production: mrpState.component.dueIn[index],
    capacity: mrpState.component.capacity,
    utilization:
      mrpState.component.dueIn[index] > 0 ? (mrpState.component.dueIn[index] / mrpState.component.capacity) * 100 : 0,
  }))

  // Calculate production metrics
  const endItemProductionPeriods = mrpState.endItem.dueIn.filter((qty) => qty > 0).length
  const componentProductionPeriods = mrpState.component.dueIn.filter((qty) => qty > 0).length

  const totalEndItemProduction = mrpState.endItem.dueIn.reduce((sum, qty) => sum + qty, 0)
  const totalComponentProduction = mrpState.component.dueIn.reduce((sum, qty) => sum + qty, 0)

  const avgEndItemBatchSize = endItemProductionPeriods > 0 ? totalEndItemProduction / endItemProductionPeriods : 0
  const avgComponentBatchSize =
    componentProductionPeriods > 0 ? totalComponentProduction / componentProductionPeriods : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">End Item Production Runs</CardTitle>
            <CardDescription>Number of periods with production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {endItemProductionPeriods} of {mrpState.periods.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800">Component Production Runs</CardTitle>
            <CardDescription>Number of periods with production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {componentProductionPeriods} of {mrpState.periods.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Avg End Item Batch</CardTitle>
            <CardDescription>Average production quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{avgEndItemBatchSize.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800">Avg Component Batch</CardTitle>
            <CardDescription>Average production quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{avgComponentBatchSize.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endItem" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endItem" className="flex items-center gap-2">
            <BoxIcon className="h-4 w-4" />
            End Item Production
          </TabsTrigger>
          <TabsTrigger value="component" className="flex items-center gap-2">
            <PackageIcon className="h-4 w-4" />
            Component Production
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endItem">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl text-blue-800">End Item Production Schedule</CardTitle>
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
                      {mrpState.periods.map((period) => (
                        <TableHead key={period} className="text-center">
                          {period}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Production Quantity</TableCell>
                      {mrpState.endItem.dueIn.map((qty, index) => (
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
                      {mrpState.endItem.dueIn.map((qty, index) => (
                        <TableCell key={index} className={`text-center ${qty > 0 ? "bg-yellow-50" : "bg-gray-50"}`}>
                          {qty > 0 ? "Yes" : "No"}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Capacity Utilization</TableCell>
                      {endItemProductionData.map((data, index) => (
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

              <div className="h-[400px] mt-6">
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
                    <BarChart data={endItemProductionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="production"
                        name="Production Quantity"
                        fill="var(--color-production)"
                      />
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
        </TabsContent>

        <TabsContent value="component">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl text-green-800">Component Production Schedule</CardTitle>
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
                      {mrpState.periods.map((period) => (
                        <TableHead key={period} className="text-center">
                          {period}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Production Quantity</TableCell>
                      {mrpState.component.dueIn.map((qty, index) => (
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
                      {mrpState.component.dueIn.map((qty, index) => (
                        <TableCell key={index} className={`text-center ${qty > 0 ? "bg-yellow-50" : "bg-gray-50"}`}>
                          {qty > 0 ? "Yes" : "No"}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Capacity Utilization</TableCell>
                      {componentProductionData.map((data, index) => (
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

              <div className="h-[400px] mt-6">
                <ChartContainer className="h-[400px] w-full"
                  config={{
                    production: {
                      label: "Production Quantity",
                      color: "hsl(var(--chart-5))",
                    },
                    capacity: {
                      label: "Capacity",
                      color: "hsl(var(--chart-6))",
                    },
                    utilization: {
                      label: "Utilization %",
                      color: "hsl(var(--chart-7))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={componentProductionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="production"
                        name="Production Quantity"
                        fill="var(--color-production)"
                      />
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
