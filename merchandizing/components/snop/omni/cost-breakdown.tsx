"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NetworkModel } from "./types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CostBreakdownProps {
  model: NetworkModel
}

export function CostBreakdown({ model }: CostBreakdownProps) {
  const { costBreakdown } = model

  // Prepare data for cost breakdown chart
  const costBreakdownData = [
    { name: "ID Fixed Cost", value: costBreakdown.idFixedCost },
    { name: "ID Transport", value: costBreakdown.idTransport },
    { name: "ID Handling", value: costBreakdown.idHandling },
    { name: "POD Transport", value: costBreakdown.podTransport },
    { name: "POD Delivery", value: costBreakdown.podDeliveryProcessing },
  ]

  // Prepare data for cost by channel chart
  const channelCostData = model.channelFlows.map((flow) => {
    // Calculate approximate cost for each channel based on volume and variable cost
    const varCost = flow.varCost * flow.delivered
    const transportCost = calculateTransportCost(flow.channelName, flow)

    return {
      name: flow.channelName,
      variableCost: varCost,
      transportCost: transportCost,
      totalCost: varCost + transportCost,
    }
  })

  // Helper function to calculate transport cost for a channel
  function calculateTransportCost(channelName: string, flow: (typeof model.channelFlows)[0]) {
    let cost = 0

    // Get transport costs for each source
    const cdcCosts = model.transportCosts.find((tc) => tc.from === "CDC")
    const id1Costs = model.transportCosts.find((tc) => tc.from === "ID 1")
    const id2Costs = model.transportCosts.find((tc) => tc.from === "ID 2")

    // Calculate based on channel
    if (channelName === "Conv. Store") {
      cost += flow.fromCDC * (cdcCosts?.convStore || 0)
      cost += flow.fromID1 * (id1Costs?.convStore || 0)
      cost += flow.fromID2 * (id2Costs?.convStore || 0)
    } else if (channelName === "Retail Store") {
      cost += flow.fromCDC * (cdcCosts?.retailStore || 0)
      cost += flow.fromID1 * (id1Costs?.retailStore || 0)
      cost += flow.fromID2 * (id2Costs?.retailStore || 0)
    } else if (channelName === "APS") {
      cost += flow.fromCDC * (cdcCosts?.aps || 0)
      cost += flow.fromID1 * (id1Costs?.aps || 0)
      cost += flow.fromID2 * (id2Costs?.aps || 0)
    } else if (channelName === "Home") {
      cost += flow.fromCDC * (cdcCosts?.home || 0)
      cost += flow.fromID1 * (id1Costs?.home || 0)
      cost += flow.fromID2 * (id2Costs?.home || 0)
    }

    return cost
  }

  // Colors for pie chart
  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">Total Cost</CardTitle>
            <CardDescription>Overall network cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">${costBreakdown.totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">ID Fixed Cost</CardTitle>
            <CardDescription>Intermediate depot fixed costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">${costBreakdown.idFixedCost.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">ID Transport</CardTitle>
            <CardDescription>Transport to intermediate depots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${costBreakdown.idTransport.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">POD Transport</CardTitle>
            <CardDescription>Transport to points of delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">${costBreakdown.podTransport.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">Other Costs</CardTitle>
            <CardDescription>Handling and processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ${(costBreakdown.idHandling + costBreakdown.podDeliveryProcessing).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="byChannel">Cost by Channel</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-purple-800">Cost Breakdown</CardTitle>
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

        <TabsContent value="byChannel">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-purple-800">Cost by Delivery Channel</CardTitle>
              <CardDescription>Comparison of costs across different delivery channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    variableCost: {
                      label: "Variable Cost",
                      color: "hsl(var(--chart-1))",
                    },
                    transportCost: {
                      label: "Transport Cost",
                      color: "hsl(var(--chart-2))",
                    },
                    totalCost: {
                      label: "Total Cost",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelCostData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="variableCost" name="Variable Cost" fill="var(--color-variableCost)" />
                      <Bar dataKey="transportCost" name="Transport Cost" fill="var(--color-transportCost)" />
                      <Bar dataKey="totalCost" name="Total Cost" fill="var(--color-totalCost)" />
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
