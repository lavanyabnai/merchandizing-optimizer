"use client"

import ChartCard from "./chart-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ProfitLossView() {
  // Revenue and Total Cost data
  const revenueAndCostData = Array.from({ length: 35 }).map((_, i) => ({
    day: i * 10,
    revenue: 5000000 + i * 1000000 + Math.random() * 500000,
    totalCost: 2000000 + i * 500000 + Math.random() * 200000,
  }))

  // Profit and Loss Statement data
  const profitLossData = [
    { id: 1, statistic: "Inventory Carrying", value: "19,138.79", unit: "USD" },
    { id: 2, statistic: "Profit", value: "26,538,460.527", unit: "USD" },
    { id: 3, statistic: "Facility Cost", value: "203,045.024", unit: "USD" },
    { id: 4, statistic: "Inventory Spend", value: "17,809,868.8", unit: "USD" },
    { id: 5, statistic: "Other Cost", value: "51,100", unit: "USD" },
  ]

  // Profit, Revenue, Total Cost data for bar chart
  const barChartData = [
    { name: "Profit", value: 26538460 },
    { name: "Revenue", value: 44718372 },
    { name: "Total Cost", value: 18179911 },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="Revenue, Total Cost" visibleItems="2 of 2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueAndCostData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value) => new Intl.NumberFormat().format(value as number)} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line type="monotone" dataKey="totalCost" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Profit and Loss Analysis" hasTable={true}>
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Statistics</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitLossData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.statistic}</TableCell>
                  <TableCell>{row.value}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>

      <ChartCard title="Profit, Revenue, Total Cost" visibleItems="3 of 3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => new Intl.NumberFormat().format(value as number)} />
            <Bar dataKey="value" name="Value (USD)" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
