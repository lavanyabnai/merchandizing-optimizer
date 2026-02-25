"use client"

import type React from "react"

import { useState } from "react"
import { Settings, ChevronDown, Maximize2, List, Filter, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

export default function RiskDashboard() {
  const [selectedView, setSelectedView] = useState("target-service-level")
  const [selectedAggregation, setSelectedAggregation] = useState("mean")

  // Generate data for service level charts
  const generateServiceLevelData = () => {
    return Array.from({ length: 20 }).map((_, i) => {
      const day = i * 20
      // Create a step pattern with values around 0.9
      let value = 0.9 + Math.random() * 0.05
      if (day > 200) {
        value = 0.95 + Math.random() * 0.05
      }
      return { day, value }
    })
  }

  // Generate data for history by replication chart
  const generateHistoryData = () => {
    return Array.from({ length: 20 }).map((_, i) => {
      const day = i * 20
      return {
        day,
        replication1: Math.random() * 0.1 + 0.85,
        replication2: Math.random() * 0.1 + 0.87,
        replication3: Math.random() * 0.1 + 0.89,
        replication4: Math.random() * 0.1 + 0.91,
        replication5: Math.random() * 0.1 + 0.93,
      }
    })
  }

  // Generate data for cost/revenue/profit charts
  const generateFinancialData = (baseValue = 10000000) => {
    return Array.from({ length: 20 }).map((_, i) => {
      const day = i * 20
      const growth = 1 + (i / 20) * 2
      return {
        day,
        value1: baseValue * growth * (1 + Math.random() * 0.1),
        value2: baseValue * growth * (1 + Math.random() * 0.08),
        value3: baseValue * growth * (1 + Math.random() * 0.06),
        value4: baseValue * growth * (1 + Math.random() * 0.04),
      }
    })
  }

  // Generate histogram data
  const generateHistogramData = () => {
    return [
      { value: 550, count: 2 },
      { value: 600, count: 1 },
      { value: 650, count: 1 },
      { value: 700, count: 0 },
      { value: 750, count: 0 },
      { value: 800, count: 1 },
      { value: 850, count: 0 },
      { value: 900, count: 4 },
      { value: 950, count: 1 },
      { value: 1000, count: 1 },
    ]
  }

  // Generate events data
  const eventsData = [
    { id: 1, replication: "Replication 5", event: "Increase in Demand", date: "6/15/2023" },
    { id: 2, replication: "Replication 5", event: "Raining season", date: "7/17/2023" },
    { id: 3, replication: "Replication 5", event: "Decrease in Demand", date: "8/15/2023" },
    { id: 4, replication: "Replication 5", event: "End of raining season", date: "9/17/2023" },
    { id: 5, replication: "Replication 5", event: "Factory failure", date: "11/10/2023" },
  ]

  // Generate recovery time data
  const recoveryTimeData = [
    { id: 1, replication: "Replication 5", product: "Shoes", startDate: "211" },
    { id: 2, replication: "Replication 1", product: "Shoes", startDate: "197" },
    { id: 3, replication: "Replication 4", product: "Shoes", startDate: "No failure" },
    { id: 4, replication: "Replication 2", product: "Shoes", startDate: "No failure" },
    { id: 5, replication: "Replication 3", product: "Shoes", startDate: "No failure" },
  ]

  // Generate data for total time to recover chart
  const generateRecoveryTimeData = () => {
    const data = []
    for (let i = 0; i <= 10; i += 0.1) {
      data.push({
        x: i.toFixed(1),
        y: i,
      })
    }
    return data
  }

  const serviceLevelData = generateServiceLevelData()
  const historyData = generateHistoryData()
  const costData = generateFinancialData(15000000)
  const revenueData = generateFinancialData(30000000)
  const profitData = generateFinancialData(20000000)
  const histogramData = generateHistogramData()
  const recoveryTimeData2 = generateRecoveryTimeData()

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  // Sidebar navigation items
  const sidebarItems = [
    { id: "target-service-level", label: "Target Service Level" },
    { id: "events-and-recovery", label: "Events and Recovery" },
    { id: "total-cost", label: "Total Cost" },
    { id: "revenue", label: "Revenue" },
    { id: "profit", label: "Profit" },
    { id: "fulfillment-received-products", label: "Fulfillment Received (Products)" },
    { id: "demand-received-dropped", label: "Demand Received (Dropped Products)" },
    { id: "demand-placed-dropped", label: "Demand Placed (Dropped Products)" },
    { id: "fulfillment-received-products-2", label: "Fulfillment Received (Products)" },
    { id: "fulfillment-late-products", label: "Fulfillment (Late Products)" },
    { id: "mean-lead-time", label: "Mean Lead Time" },
    { id: "max-lead-time", label: "Max Lead Time" },
    { id: "bullwhip-effect-by-product", label: "Bullwhip Effect by Product" },
  ]

  // Render the appropriate content based on the selected view
  const renderContent = () => {
    switch (selectedView) {
      case "target-service-level":
        return renderServiceLevelView()
      case "events-and-recovery":
        return renderEventsAndRecoveryView()
      case "total-cost":
        return renderFinancialView(costData, "Total Cost")
      case "revenue":
        return renderFinancialView(revenueData, "Revenue")
      case "profit":
        return renderFinancialView(profitData, "Profit")
      case "fulfillment-late-products":
        return renderEmptyView()
      default:
        return renderServiceLevelView()
    }
  }

  // Render service level view
  const renderServiceLevelView = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        <ChartCard title="History by Replication">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 1]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]} />
              <Tooltip formatter={(value: number | string) => {
                const num = typeof value === "number" ? value : parseFloat(value as string)
                return isNaN(num) ? value : num.toFixed(3)
              }} />
              <Line type="monotone" dataKey="replication1" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="replication2" stroke="#82ca9d" dot={false} />
              <Line type="monotone" dataKey="replication3" stroke="#ffc658" dot={false} />
              <Line type="monotone" dataKey="replication4" stroke="#ff8042" dot={false} />
              <Line type="monotone" dataKey="replication5" stroke="#0088fe" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Best-Mean-Worst">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serviceLevelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 1]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]} />
              <Tooltip formatter={(value: number | string) => {
                const num = typeof value === "number" ? value : parseFloat(value as string)
                return isNaN(num) ? value : num.toFixed(3)
              }} />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    )
  }

  // Render events and recovery view
  const renderEventsAndRecoveryView = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="p-4 flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-medium">Events Table</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Replication</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.replication}</TableCell>
                    <TableCell>{row.event}</TableCell>
                    <TableCell>{row.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-medium">Recovery Time</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Replication</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Start date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recoveryTimeData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.replication}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.startDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ChartCard title="Total Time to Recover">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recoveryTimeData2} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="y" stroke="#82ca9d" strokeWidth={2} dot={false} />
              <ReferenceLine x="0.5" stroke="#82ca9d" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    )
  }

  // Render financial view (cost, revenue, profit)
  const renderFinancialView = (data: any[], title: string) => {
    return (
      <div className="grid grid-cols-3 gap-4">
        <ChartCard title={`${title} History by Replication`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value as number)} />
              <Line type="monotone" dataKey="value1" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="value2" stroke="#82ca9d" dot={false} />
              <Line type="monotone" dataKey="value3" stroke="#ffc658" dot={false} />
              <Line type="monotone" dataKey="value4" stroke="#ff8042" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Histogram">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="value" />
              <YAxis domain={[0, 4]} ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
              <Line
                type="monotone"
                data={histogramData.map((item) => ({ value: item.value, count2: item.count * 0.5 + 1 }))}
                dataKey="count2"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Best-Mean-Worst">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value as number)} />
              <Line type="monotone" dataKey="value1" stroke="#8884d8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="value3" stroke="#82ca9d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    )
  }

  // Render empty view for sections without data
  const renderEmptyView = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        <ChartCard title="History by Replication">
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
            <div className="bg-gray-100 rounded-full p-8 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400"
              >
                <rect x="3" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="9.5" y="3" width="5" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="16" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <span>No data to display</span>
          </div>
        </ChartCard>

        <ChartCard title="Histogram">
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
            <div className="bg-gray-100 rounded-full p-8 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400"
              >
                <rect x="3" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="9.5" y="3" width="5" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="16" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <span>No data to display</span>
          </div>
        </ChartCard>

        <ChartCard title="Best-Mean-Worst">
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
            <div className="bg-gray-100 rounded-full p-8 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400"
              >
                <rect x="3" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="9.5" y="3" width="5" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="16" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <span>No data to display</span>
          </div>
        </ChartCard>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white flex flex-col">
        <div className="p-4">
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer ${
                selectedView === item.id
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => setSelectedView(item.id)}
            >
              <div
                className={`h-2 w-2 rounded-full ${selectedView === item.id ? "bg-orange-500" : "bg-gray-400"}`}
              ></div>
              <span className="text-sm">{item.label}</span>
              {selectedView === item.id && (
                <Button variant="ghost" size="icon" className="ml-auto h-6 w-6 text-gray-400">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Top Metrics */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={selectedAggregation} onValueChange={setSelectedAggregation}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Mean" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mean">Mean</SelectItem>
              <SelectItem value="min">Min</SelectItem>
              <SelectItem value="max">Max</SelectItem>
            </SelectContent>
          </Select>

          <Card className="shadow-sm flex-1">
            <CardContent className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Service Level by Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">0.893 Ratio</span>
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">N/A</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm flex-1">
            <CardContent className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Service Level by Products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">0.893 Ratio</span>
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">N/A</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm flex-1">
            <CardContent className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Total Time to Recover</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">0 day</span>
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">N/A</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  )
}

// Chart Card Component
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 flex-row items-center justify-between border-b">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-64">{children}</CardContent>
      <div className="p-2 border-t flex items-center justify-between text-xs text-gray-500">
        <div>Chart items visible: 10 of 10</div>
        <List className="h-4 w-4" />
      </div>
    </Card>
  )
}
