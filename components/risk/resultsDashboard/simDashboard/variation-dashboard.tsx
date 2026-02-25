"use client"

import { useState } from "react"
import { Download, Settings, Plus, ChevronDown, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function VariationDashboard() {
  const [selectedIteration, setSelectedIteration] = useState("1")
  const [selectedAggregation, setSelectedAggregation] = useState("mean")

  // Sample data for the variation experiment
  const variationData = [
    {
      id: 1,
      iteration: 1,
      description: "",
      statisticsName: "Total Cost",
      min: 17116319.18,
      max: 17116319.18,
      mean: 17116319.18,
      standardDeviation: 0,
    },
    {
      id: 2,
      iteration: 1,
      description: "",
      statisticsName: "Revenue",
      min: 34953848.0,
      max: 34953848.0,
      mean: 34953848.0,
      standardDeviation: 0,
    },
    {
      id: 3,
      iteration: 1,
      description: "",
      statisticsName: "Profit",
      min: 17837528.82,
      max: 17837528.82,
      mean: 17837528.82,
      standardDeviation: 0,
    },
  ]

  // Filter states
  const [filters, setFilters] = useState({
    iteration: "",
    description: "",
    statisticsName: "",
    min: "",
    max: "",
    mean: "",
    standardDeviation: "",
  })

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Filter the data based on the current filters
  const filteredData = variationData.filter((item) => {
    return (
      (filters.iteration === "" || item.iteration.toString().includes(filters.iteration)) &&
      (filters.description === "" ||
        (item.description && item.description.toLowerCase().includes(filters.description.toLowerCase()))) &&
      (filters.statisticsName === "" ||
        item.statisticsName.toLowerCase().includes(filters.statisticsName.toLowerCase())) &&
      (filters.min === "" || item.min.toString().includes(filters.min)) &&
      (filters.max === "" || item.max.toString().includes(filters.max)) &&
      (filters.mean === "" || item.mean.toString().includes(filters.mean)) &&
      (filters.standardDeviation === "" || item.standardDeviation.toString().includes(filters.standardDeviation))
    )
  })

  // Format number with commas and 2 decimal places
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-orange-500 flex items-center">
              <span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
              Variation results
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-gray-500">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              Page 1
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">Result 2 Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Plus className="mr-1 h-4 w-4" />
              Add new chart
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Settings className="mr-1 h-4 w-4" />
                  KPI setting
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Configure KPIs</DropdownMenuItem>
                <DropdownMenuItem>Reset to default</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Selectors and Metrics */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={selectedIteration} onValueChange={setSelectedIteration}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Iteration 1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Iteration 1</SelectItem>
              <SelectItem value="2">Iteration 2</SelectItem>
              <SelectItem value="3">Iteration 3</SelectItem>
            </SelectContent>
          </Select>

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
                <span className="text-sm">Total Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatNumber(17116319.18)} USD</span>
                <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">+71.8%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>
                    Iteration
                    <div className="mt-1">
                      <Input
                        placeholder="Filter"
                        className="h-8 text-xs"
                        value={filters.iteration}
                        onChange={(e) => handleFilterChange("iteration", e.target.value)}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    Description
                    <div className="mt-1">
                      <Input
                        placeholder="Filter"
                        className="h-8 text-xs"
                        value={filters.description}
                        onChange={(e) => handleFilterChange("description", e.target.value)}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    Statistics name
                    <div className="mt-1">
                      <Input
                        placeholder="Filter"
                        className="h-8 text-xs"
                        value={filters.statisticsName}
                        onChange={(e) => handleFilterChange("statisticsName", e.target.value)}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    Min
                    <div className="mt-1">
                      <Input
                        placeholder="Filter"
                        className="h-8 text-xs"
                        value={filters.min}
                        onChange={(e) => handleFilterChange("min", e.target.value)}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    Max
                    <div className="mt-1">
                      <Input
                        placeholder="Filter"
                        className="h-8 text-xs"
                        value={filters.max}
                        onChange={(e) => handleFilterChange("max", e.target.value)}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    Mean
                    <div className="mt-1">
                      <Input
                        placeholder="Filter"
                        className="h-8 text-xs"
                        value={filters.mean}
                        onChange={(e) => handleFilterChange("mean", e.target.value)}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    Standard deviation
                    <div className="mt-1">
                      <Input
                        placeholder="Filter"
                        className="h-8 text-xs"
                        value={filters.standardDeviation}
                        onChange={(e) => handleFilterChange("standardDeviation", e.target.value)}
                      />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{row.iteration}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.statisticsName}</TableCell>
                      <TableCell>{formatNumber(row.min)}</TableCell>
                      <TableCell>{formatNumber(row.max)}</TableCell>
                      <TableCell>{formatNumber(row.mean)}</TableCell>
                      <TableCell>{row.standardDeviation}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      No results match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
