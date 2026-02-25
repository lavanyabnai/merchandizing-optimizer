"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MrpState } from "@/components/snop/mrp/types"
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
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CostSummaryProps {
  mrpState: MrpState
}

export function CostSummary({ mrpState }: CostSummaryProps) {
  // Calculate setup and holding costs for end items
  const endItemSetupCost = mrpState.endItem.dueIn.filter((qty) => qty > 0).length * mrpState.endItem.setupCost
  const endItemHoldingCost = mrpState.endItem.endingInventory.reduce(
    (sum, inv) => sum + inv * mrpState.endItem.holdingCost,
    0,
  )

  // Calculate setup and holding costs for components
  const componentSetupCost = mrpState.component.dueIn.filter((qty) => qty > 0).length * mrpState.component.setupCost
  const componentHoldingCost = mrpState.component.endingInventory.reduce(
    (sum, inv) => sum + inv * mrpState.component.holdingCost,
    0,
  )

  // Prepare data for cost breakdown chart
  const costBreakdownData = [
    { name: "End Item Setup", value: endItemSetupCost },
    { name: "End Item Holding", value: endItemHoldingCost },
    { name: "Component Setup", value: componentSetupCost },
    { name: "Component Holding", value: componentHoldingCost },
  ]

  // Prepare data for level comparison chart
  const levelComparisonData = [
    {
      name: "End Item",
      setup: endItemSetupCost,
      holding: endItemHoldingCost,
      total: endItemSetupCost + endItemHoldingCost,
    },
    {
      name: "Component",
      setup: componentSetupCost,
      holding: componentHoldingCost,
      total: componentSetupCost + componentHoldingCost,
    },
  ]

  // Prepare data for cost type comparison
  const costTypeData = [
    {
      name: "Setup Cost",
      endItem: endItemSetupCost,
      component: componentSetupCost,
      total: endItemSetupCost + componentSetupCost,
    },
    {
      name: "Holding Cost",
      endItem: endItemHoldingCost,
      component: componentHoldingCost,
      total: endItemHoldingCost + componentHoldingCost,
    },
  ]

  // Colors for pie chart
  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Total System Cost</CardTitle>
            <CardDescription>Sum of all costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">${mrpState.totalSystemCost.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Total Setup Cost</CardTitle>
            <CardDescription>All levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${(endItemSetupCost + componentSetupCost).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Total Holding Cost</CardTitle>
            <CardDescription>All levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ${(endItemHoldingCost + componentHoldingCost).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Avg. Inventory Value</CardTitle>
            <CardDescription>Per period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              $
              {(
                (endItemHoldingCost / mrpState.endItem.holdingCost +
                  componentHoldingCost / mrpState.component.holdingCost) /
                12
              ).toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="byLevel">By Supply Chain Level</TabsTrigger>
          <TabsTrigger value="byCostType">By Cost Type</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown">
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
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byLevel">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Cost by Supply Chain Level</CardTitle>
              <CardDescription>Comparison of costs at each level of the supply chain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer className="h-[400px] w-full"
                  config={{
                    setup: {
                      label: "Setup Cost",
                      color: "hsl(var(--chart-1))",
                    },
                    holding: {
                      label: "Holding Cost",
                      color: "hsl(var(--chart-2))",
                    },
                    total: {
                      label: "Total Cost",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={levelComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="setup" name="Setup Cost" fill="var(--color-setup)" />
                      <Bar dataKey="holding" name="Holding Cost" fill="var(--color-holding)" />
                      <Bar dataKey="total" name="Total Cost" fill="var(--color-total)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byCostType">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Cost by Type</CardTitle>
              <CardDescription>Comparison of setup vs. holding costs across supply chain levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer className="h-[400px] w-full"
                  config={{
                    endItem: {
                      label: "End Item",
                      color: "hsl(var(--chart-1))",
                    },
                    component: {
                      label: "Component",
                      color: "hsl(var(--chart-2))",
                    },
                    total: {
                      label: "Total",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="endItem" name="End Item" fill="var(--color-endItem)" />
                      <Bar dataKey="component" name="Component" fill="var(--color-component)" />
                      <Bar dataKey="total" name="Total" fill="var(--color-total)" />
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
