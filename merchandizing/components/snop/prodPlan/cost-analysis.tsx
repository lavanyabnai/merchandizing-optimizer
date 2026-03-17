"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ModelState } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface CostAnalysisProps {
  modelState: ModelState
}

export function CostAnalysis({ modelState }: CostAnalysisProps) {
  const totalSetupCost = modelState.setupCost.reduce((sum, cost) => sum + cost, 0)
  const totalHoldingCost = modelState.holdingCost.reduce((sum, cost) => sum + cost, 0)
  const grandTotal = totalSetupCost + totalHoldingCost

  const costBreakdownData = [
    { name: "Setup Cost", value: totalSetupCost },
    { name: "Holding Cost", value: totalHoldingCost },
  ]

  const COLORS = ["#3b82f6", "#10b981"]

  const periodCostData = modelState.periods.map((period, index) => ({
    period,
    setupCost: modelState.setupCost[index],
    holdingCost: modelState.holdingCost[index],
    totalCost: modelState.totalCost[index],
  }))

  const cumulativeCostData = modelState.periods.map((period, index) => {
    const setupCostSum = modelState.setupCost.slice(0, index + 1).reduce((sum, cost) => sum + cost, 0)
    const holdingCostSum = modelState.holdingCost.slice(0, index + 1).reduce((sum, cost) => sum + cost, 0)

    return {
      period,
      setupCost: setupCostSum,
      holdingCost: holdingCostSum,
      totalCost: setupCostSum + holdingCostSum,
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Total Setup Cost</CardTitle>
            <CardDescription>Sum of all production setup costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">${totalSetupCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Total Holding Cost</CardTitle>
            <CardDescription>Sum of all inventory holding costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${totalHoldingCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Total Cost</CardTitle>
            <CardDescription>Sum of all costs in the model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">${grandTotal.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="periodCosts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="periodCosts">Period Costs</TabsTrigger>
          <TabsTrigger value="cumulativeCosts">Cumulative Costs</TabsTrigger>
          <TabsTrigger value="costBreakdown">Cost Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="periodCosts">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Period Cost Analysis</CardTitle>
              <CardDescription>Breakdown of costs by period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer className="h-[400px] w-full"
                  config={{
                    setupCost: {
                      label: "Setup Cost",
                      color: "hsl(var(--chart-1))",
                    },
                    holdingCost: {
                      label: "Holding Cost",
                      color: "hsl(var(--chart-2))",
                    },
                    totalCost: {
                      label: "Total Cost",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={periodCostData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="setupCost" name="Setup Cost" fill="var(--color-setupCost)" />
                      <Bar dataKey="holdingCost" name="Holding Cost" fill="var(--color-holdingCost)" />
                      <Bar dataKey="totalCost" name="Total Cost" fill="var(--color-totalCost)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cumulativeCosts">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Cumulative Cost Analysis</CardTitle>
              <CardDescription>Running total of costs over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer className="h-[400px] w-full"
                  config={{
                    setupCost: {
                      label: "Setup Cost",
                      color: "hsl(var(--chart-1))",
                    },
                    holdingCost: {
                      label: "Holding Cost",
                      color: "hsl(var(--chart-2))",
                    },
                    totalCost: {
                      label: "Total Cost",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeCostData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="setupCost"
                        name="Setup Cost"
                        stroke="var(--color-setupCost)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="holdingCost"
                        name="Holding Cost"
                        stroke="var(--color-holdingCost)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalCost"
                        name="Total Cost"
                        stroke="var(--color-totalCost)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costBreakdown">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Cost Breakdown</CardTitle>
              <CardDescription>Proportion of different cost components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdownData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
