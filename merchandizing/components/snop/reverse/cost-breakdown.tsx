"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReverseLogisticsModel } from "./types"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts"

interface CostBreakdownProps {
  model: ReverseLogisticsModel
}

export function CostBreakdown({ model }: CostBreakdownProps) {
  const { costBreakdown } = model

  // Prepare data for pie chart
  const pieData = [
    {
      name: "Recycling Fixed Cost",
      value: costBreakdown.recyclingFixedCost,
      color: "#10b981",
    },
    {
      name: "Recycling Variable Cost",
      value: costBreakdown.recyclingVariableCost,
      color: "#34d399",
    },
    {
      name: "Storage/Sorting Fixed Cost",
      value: costBreakdown.storageSortingFixedCost,
      color: "#3b82f6",
    },
    {
      name: "Storage/Sorting Variable Cost",
      value: costBreakdown.storageSortingVariableCost,
      color: "#60a5fa",
    },
    {
      name: "CP-Recycling Transport Cost",
      value: costBreakdown.cpRecyclingTransportCost,
      color: "#f59e0b",
    },
  ]

  // Prepare data for bar chart
  const barData = [
    {
      name: "Recycling",
      fixed: costBreakdown.recyclingFixedCost,
      variable: costBreakdown.recyclingVariableCost,
    },
    {
      name: "Storage/Sorting",
      fixed: costBreakdown.storageSortingFixedCost,
      variable: costBreakdown.storageSortingVariableCost,
    },
    {
      name: "Transport",
      fixed: 0,
      variable: costBreakdown.cpRecyclingTransportCost,
    },
  ]

  // Calculate percentages for each cost component
  const totalCost = costBreakdown.totalCost
  const recyclingCostPercentage = (
    ((costBreakdown.recyclingFixedCost + costBreakdown.recyclingVariableCost) / totalCost) *
    100
  ).toFixed(1)
  const sortingCostPercentage = (
    ((costBreakdown.storageSortingFixedCost + costBreakdown.storageSortingVariableCost) / totalCost) *
    100
  ).toFixed(1)
  const transportCostPercentage = ((costBreakdown.cpRecyclingTransportCost / totalCost) * 100).toFixed(1)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Distribution of costs across the reverse logistics network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Cost"]}
                  labelFormatter={(name) => name}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fixed vs. Variable Costs</CardTitle>
          <CardDescription>Comparison of fixed and variable costs by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Cost"]} />
                <Legend />
                <Bar dataKey="fixed" name="Fixed Cost" fill="#3b82f6" stackId="a" />
                <Bar dataKey="variable" name="Variable Cost" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Cost Summary</CardTitle>
          <CardDescription>Total cost: ${costBreakdown.totalCost.toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-green-600 mb-1">Recycling Costs</div>
              <div className="text-2xl font-bold">
                ${(costBreakdown.recyclingFixedCost + costBreakdown.recyclingVariableCost).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">{recyclingCostPercentage}% of total cost</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-500">Fixed</div>
                  <div>${costBreakdown.recyclingFixedCost.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Variable</div>
                  <div>${costBreakdown.recyclingVariableCost.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-600 mb-1">Storage/Sorting Costs</div>
              <div className="text-2xl font-bold">
                ${(costBreakdown.storageSortingFixedCost + costBreakdown.storageSortingVariableCost).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">{sortingCostPercentage}% of total cost</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-500">Fixed</div>
                  <div>${costBreakdown.storageSortingFixedCost.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Variable</div>
                  <div>${costBreakdown.storageSortingVariableCost.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="text-sm text-amber-600 mb-1">Transport Costs</div>
              <div className="text-2xl font-bold">${costBreakdown.cpRecyclingTransportCost.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{transportCostPercentage}% of total cost</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-500">CP to Sorting</div>
                  <div>${(costBreakdown.cpRecyclingTransportCost * 0.4).toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-gray-500">CP to Recycling</div>
                  <div>${(costBreakdown.cpRecyclingTransportCost * 0.6).toFixed(0)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
