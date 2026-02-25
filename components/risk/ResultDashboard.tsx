"use client"

import { useState } from "react"
import { ChevronDown, Plus, Settings, Star, MoreHorizontal, Maximize2, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Sample data for the tables
const productFlowsData = [
  { iteration: 1, period: 1, from: "Body Supplies", to: "Basic period" },
  { iteration: 2, period: 1, from: "Processor Su", to: "Basic period" },
  { iteration: 3, period: 1, from: "Screen Suppl", to: "Basic period" },
  { iteration: 4, period: 1, from: "Smartphone", to: "Basic period" },
]

const siteStateData = [
  { iteration: 1, period: 1, site: "DC Sydney" },
  { iteration: 2, period: 1, site: "DC Berlin" },
  { iteration: 3, period: 1, site: "DC Chicago" },
]

const otherCostsData = [
  { iteration: 1, period: 1, site: "DC Sydney" },
  { iteration: 2, period: 1, site: "DC Berlin" },
  { iteration: 3, period: 1, site: "DC Chicago" },
]

const operatingSitesData = [
  { iteration: 1, period: 1, site: "DC Sydney" },
  { iteration: 2, period: 1, site: "DC Berlin" },
  { iteration: 3, period: 1, site: "DC Chicago" },
  { iteration: 4, period: 1, site: "Smartphone" },
]

const storageByProductData = [
  { iteration: 1, period: 1, facility: "DC Sydney" },
  { iteration: 2, period: 1, facility: "DC Chicago" },
  { iteration: 3, period: 1, facility: "DC Berlin" },
  { iteration: 4, period: 1, facility: "Smartphone" },
]

const productionCostData = [{ iteration: 1, period: 1, facility: "Smartphone F." }]

const productionFlowsData = [
  { iteration: 1, period: 1, facility: "Smartphone" },
  { iteration: 2, period: 1, facility: "Smartphone" },
  { iteration: 3, period: 1, facility: "Smartphone" },
  { iteration: 4, period: 1, facility: "Smartphone" },
]

const demandFulfillmentData = [
  { iteration: 1, period: 1, customer: "Indianapolis" },
  { iteration: 2, period: 1, customer: "Baltimore" },
  { iteration: 3, period: 1, customer: "Amsterdam" },
  { iteration: 4, period: 1, customer: "Lisbon" },
]

const namedExpressionsData = [
  { iteration: 1, period: 1, expressionName: "Total Production C...", value: "92.3" },
  { iteration: 2, period: 1, expressionName: "Total Revenue", value: "6,458.3" },
  { iteration: 3, period: 1, expressionName: "Total Closing Cost", value: "" },
  { iteration: 4, period: 1, expressionName: "Total CO2 Emission", value: "" },
]

const objectiveMembersData = [
  { iteration: 1, objectiveMember: "CO2 Emission", value: "" },
  { iteration: 2, objectiveMember: "Revenue", value: "6,458.3" },
  { iteration: 3, objectiveMember: "Tariffs", value: "" },
  { iteration: 4, objectiveMember: "Closing Cost", value: "" },
]

const overallStatsData = [{ iteration: 1, revenue: "6,458,348,988", tariffs: "" }]

// Add a new component for empty state tables
const EmptyStateMessage = () => (
  <div className="flex items-center justify-center h-32 text-gray-500 text-sm">No data to display</div>
)

export default function Component() {
  const [selectedIteration, setSelectedIteration] = useState("1")

  const KPICard = ({ title, value, unit, status }: { title: string; value: string; unit: string; status: string }) => (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            {status}
          </Badge>
        </div>
        <div className="mt-2">
          <span className="text-lg font-semibold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500 ml-1">{unit}</span>
        </div>
      </CardContent>
    </Card>
  )

  const DataTable = ({
    title,
    data,
    columns,
  }: {
    title: string
    data: any[]
    columns: { key: string; label: string; filter?: boolean }[]
  }) => (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              {columns.map((column) => (
                <TableHead key={column.key} className="h-8 px-3 text-xs font-medium text-gray-500">
                  <div className="flex flex-col gap-1">
                    <span>{column.label}</span>
                    {column.filter && (
                      <Select defaultValue="filter">
                        <SelectTrigger className="h-6 text-xs border-gray-300">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="filter">Filter</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((column) => (
                  <TableCell key={column.key} className="px-3 py-2 text-sm text-gray-700">
                    {row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  // Chart data based on dashboard data
  const sitePerformanceData = [
    { site: "DC Sydney", revenue: 2152782996, costs: 1046122210, profit: 1106660786 },
    { site: "DC Berlin", revenue: 2152782996, costs: 1046122210, profit: 1106660786 },
    { site: "DC Chicago", revenue: 2152782996, costs: 1046122210, profit: 1106660786 },
  ]

  const customerDemandData = [
    { customer: "Indianapolis", demand: 25, fulfillment: 92 },
    { customer: "Baltimore", demand: 30, fulfillment: 88 },
    { customer: "Amsterdam", demand: 22, fulfillment: 95 },
    { customer: "Lisbon", demand: 23, fulfillment: 87 },
  ]

  const financialTrendData = [
    { period: "Q1", revenue: 1614587247, profit: 829995589, costs: 784591658 },
    { period: "Q2", revenue: 1614587247, profit: 829995589, costs: 784591658 },
    { period: "Q3", revenue: 1614587247, profit: 829995589, costs: 784591658 },
    { period: "Q4", revenue: 1614587247, profit: 829995589, costs: 784591658 },
  ]

  const objectiveDistributionData = [
    { name: "Revenue", value: 65, color: "#0088FE" },
    { name: "CO2 Emission", value: 15, color: "#00C49F" },
    { name: "Tariffs", value: 10, color: "#FFBB28" },
    { name: "Closing Cost", value: 10, color: "#FF8042" },
  ]

  const productionFlowData = [
    { facility: "Smartphone Factory", production: 92.3, capacity: 100, efficiency: 92.3 },
    { facility: "Body Supplies", production: 85.7, capacity: 100, efficiency: 85.7 },
    { facility: "Processor Supply", production: 78.9, capacity: 100, efficiency: 78.9 },
    { facility: "Screen Supply", production: 88.2, capacity: 100, efficiency: 88.2 },
  ]

  return (
    <div className="min-h-screen p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Result Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add new chart
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Star className="h-4 w-4" />
                  KPI setting
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Configure KPIs</DropdownMenuItem>
                <DropdownMenuItem>Export Settings</DropdownMenuItem>
                <DropdownMenuItem>Reset to Default</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Iteration Selector */}
        <div className="flex items-center gap-2">
          <Select value={selectedIteration} onValueChange={setSelectedIteration}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Iteration 1</SelectItem>
              <SelectItem value="2">Iteration 2</SelectItem>
              <SelectItem value="3">Iteration 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Flows Amount" value="572,843,544" unit="m³" status="N/A" />
          <KPICard title="Revenue" value="6,458,348,988" unit="USD" status="N/A" />
          <KPICard title="Profit" value="3,319,982,357.424" unit="USD" status="N/A" />
          <KPICard title="Total Costs" value="3,138,366,630.576" unit="USD" status="N/A" />
        </div>

        {/* Tabs for Dashboard and Charts */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="dashboard">Dashboard Tables</TabsTrigger>
            <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* All existing table content goes here */}
            {/* Data Tables Grid - First Set */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DataTable
                title="Product Flows"
                data={productFlowsData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "period", label: "Period", filter: true },
                  { key: "from", label: "From", filter: true },
                ]}
              />

              <DataTable
                title="Site State"
                data={siteStateData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "period", label: "Period", filter: true },
                  { key: "site", label: "Site", filter: true },
                ]}
              />

              <DataTable
                title="Other Costs"
                data={otherCostsData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "period", label: "Period", filter: true },
                  { key: "site", label: "Site", filter: true },
                ]}
              />

              <DataTable
                title="Operating Sites"
                data={operatingSitesData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "period", label: "Period", filter: true },
                  { key: "site", label: "Site", filter: true },
                ]}
              />

              <DataTable
                title="Storage by Product"
                data={storageByProductData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "period", label: "Period", filter: true },
                  { key: "facility", label: "Facility", filter: true },
                ]}
              />

              <DataTable
                title="Production Cost"
                data={productionCostData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "period", label: "Period", filter: true },
                  { key: "facility", label: "Facility", filter: true },
                ]}
              />
            </div>

            {/* Data Tables Grid - Second Set */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DataTable
                title="Production Flows"
                data={productionFlowsData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "period", label: "Period", filter: true },
                  { key: "facility", label: "Facility", filter: true },
                ]}
              />

              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">Shared Flow Constraints</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <EmptyStateMessage />
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">Shared Storages Constraints</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <EmptyStateMessage />
                </CardContent>
              </Card>
            </div>

            {/* Data Tables Grid - Third Set */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DataTable
                title="Demand Fulfillment"
                data={demandFulfillmentData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "period", label: "Period", filter: true },
                  { key: "customer", label: "Customer", filter: true },
                ]}
              />

              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">Vehicle Flows</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <EmptyStateMessage />
                </CardContent>
              </Card>

              <DataTable
                title="Named Expressions"
                data={namedExpressionsData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "expressionName", label: "Expression Name", filter: true },
                  { key: "value", label: "Value", filter: true },
                ]}
              />
            </div>

            {/* Data Tables Grid - Fourth Set */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataTable
                title="Objective Members"
                data={objectiveMembersData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "objectiveMember", label: "Objective Member", filter: true },
                  { key: "value", label: "Value", filter: true },
                ]}
              />

              <DataTable
                title="Overall Stats"
                data={overallStatsData}
                columns={[
                  { key: "iteration", label: "Iteration", filter: true },
                  { key: "revenue", label: "Revenue", filter: true },
                  { key: "tariffs", label: "Tariffs", filter: true },
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            {/* Financial Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                      costs: { label: "Costs", color: "hsl(var(--chart-2))" },
                      profit: { label: "Profit", color: "hsl(var(--chart-3))" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sitePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="site" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" name="Revenue" />
                        <Bar dataKey="costs" fill="var(--color-costs)" name="Costs" />
                        <Bar dataKey="profit" fill="var(--color-profit)" name="Profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                      profit: { label: "Profit", color: "hsl(var(--chart-3))" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={financialTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stackId="1"
                          stroke="var(--color-revenue)"
                          fill="var(--color-revenue)"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="profit"
                          stackId="1"
                          stroke="var(--color-profit)"
                          fill="var(--color-profit)"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Customer and Production Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Demand Fulfillment</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      demand: { label: "Demand", color: "hsl(var(--chart-1))" },
                      fulfillment: { label: "Fulfillment %", color: "hsl(var(--chart-2))" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerDemandData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="customer" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="demand" fill="var(--color-demand)" name="Demand" />
                        <Bar dataKey="fulfillment" fill="var(--color-fulfillment)" name="Fulfillment %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Objective Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: { label: "Revenue", color: "#0088FE" },
                      emission: { label: "CO2 Emission", color: "#00C49F" },
                      tariffs: { label: "Tariffs", color: "#FFBB28" },
                      costs: { label: "Closing Cost", color: "#FF8042" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={objectiveDistributionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {objectiveDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Production Efficiency Chart */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Production Facility Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      production: { label: "Production", color: "hsl(var(--chart-1))" },
                      capacity: { label: "Capacity", color: "hsl(var(--chart-2))" },
                      efficiency: { label: "Efficiency %", color: "hsl(var(--chart-3))" },
                    }}
                    className="h-[400px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productionFlowData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="facility" type="category" width={120} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="production" fill="var(--color-production)" name="Production" />
                        <Bar dataKey="efficiency" fill="var(--color-efficiency)" name="Efficiency %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
