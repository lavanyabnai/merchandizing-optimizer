"use client"

import { useState } from "react"
import {
  Download,
  Settings,
  Plus,
  ChevronDown,
  Filter,
  Grid,
  Search,
  ZoomIn,
  ArrowRightIcon as ArrowsMaximize,
  RefreshCw,
  List,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts"

export default function SafetyStockDashboard() {
  const [selectedIteration, setSelectedIteration] = useState("1")
  const [selectedAggregation, setSelectedAggregation] = useState("mean")
  const [serviceLevel] = useState(95)
  const [stockoutRisk] = useState(5)

  const [filters, setFilters] = useState({
    product: "",
    currentStock: "",
    safetyStock: "",
    reorderPoint: "",
    leadTime: "",
    serviceLevel: "",
  })

  // Generate safety stock data
  const generateSafetyStockData = () => {
    return Array.from({ length: 20 }).map((_, i) => {
      const day = i * 20
      return {
        day,
        safetyStock: 500 + Math.random() * 100,
        actualInventory: 550 + Math.random() * 150,
        minRequired: 450,
      }
    })
  }

  // Generate product data
  const generateProductData = () => {
    return [
      {
        id: 1,
        product: "Product A",
        currentStock: 520,
        safetyStock: 300,
        reorderPoint: 450,
        leadTime: 5,
        serviceLevel: 95,
      },
      {
        id: 2,
        product: "Product B",
        currentStock: 320,
        safetyStock: 200,
        reorderPoint: 350,
        leadTime: 4,
        serviceLevel: 92,
      },
      {
        id: 3,
        product: "Product C",
        currentStock: 180,
        safetyStock: 150,
        reorderPoint: 250,
        leadTime: 6,
        serviceLevel: 90,
      },
      {
        id: 4,
        product: "Product D",
        currentStock: 420,
        safetyStock: 250,
        reorderPoint: 400,
        leadTime: 3,
        serviceLevel: 97,
      },
      {
        id: 5,
        product: "Product E",
        currentStock: 280,
        safetyStock: 180,
        reorderPoint: 300,
        leadTime: 7,
        serviceLevel: 93,
      },
    ]
  }

  const safetyStockData = generateSafetyStockData()
  const productData = generateProductData()

  // Filter the data based on the current filters
  const filteredData = productData.filter((item) => {
    return (
      (filters.product === "" || item.product.toLowerCase().includes(filters.product.toLowerCase())) &&
      (filters.currentStock === "" || item.currentStock.toString().includes(filters.currentStock)) &&
      (filters.safetyStock === "" || item.safetyStock.toString().includes(filters.safetyStock)) &&
      (filters.reorderPoint === "" || item.reorderPoint.toString().includes(filters.reorderPoint)) &&
      (filters.leadTime === "" || item.leadTime.toString().includes(filters.leadTime)) &&
      (filters.serviceLevel === "" || item.serviceLevel.toString().includes(filters.serviceLevel))
    )
  })

  // // Format number with commas
  // const formatNumber = (num: number) => {
  //   return new Intl.NumberFormat("en-US").format(num)
  // }

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-orange-500 flex items-center">
              <span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
              Safety Stock Analysis
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar metrics */}
          <div className="mb-4 border rounded-md p-3 bg-gray-50">
            <div className="text-xs font-medium text-gray-500 mb-2">Current Status</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Products</span>
                <span className="text-xs font-medium">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Below Safety</span>
                <span className="text-xs font-medium text-red-600">7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Near Threshold</span>
                <span className="text-xs font-medium text-yellow-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Optimal</span>
                <span className="text-xs font-medium text-green-600">23</span>
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="mb-4 border rounded-md p-3">
            <div className="text-xs font-medium text-gray-500 mb-2">Service Level Trend</div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { day: 1, value: 92 },
                    { day: 2, value: 93 },
                    { day: 3, value: 94 },
                    { day: 4, value: 93 },
                    { day: 5, value: 95 },
                    { day: 6, value: 94 },
                    { day: 7, value: 95 },
                  ]}
                  margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                >
                  <Area type="monotone" dataKey="value" stroke="#f97316" fill="#ffedd5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-xs font-medium text-gray-500 mb-2">Analysis Views</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              <span className="text-sm">Overview</span>
              <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4">5</Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              <span className="text-sm">Service Level Analysis</span>
              <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4">3</Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              <span className="text-sm">Demand Variability</span>
              <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4">7</Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              <span className="text-sm">Lead Time Analysis</span>
              <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4">4</Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              <span className="text-sm">Stockout Probability</span>
              <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-red-100 text-red-800">2</Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 p-2 rounded cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              <span className="text-sm">Cost Analysis</span>
              <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4">6</Badge>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 text-orange-600 p-2 rounded cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
              <span className="text-sm">Product Analysis</span>
              <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-orange-100 text-orange-800">8</Badge>
            </div>
          </div>

          {/* Recent alerts */}
          <div className="mt-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Recent Alerts</div>
            <div className="flex flex-col gap-2">
              <div className="border rounded-md p-2 bg-red-50 text-xs">
                <div className="font-medium text-red-800">Product C below safety stock</div>
                <div className="text-gray-600 mt-1">Current: 180, Safety: 150</div>
                <div className="text-gray-500 mt-1">2 hours ago</div>
              </div>
              <div className="border rounded-md p-2 bg-yellow-50 text-xs">
                <div className="font-medium text-yellow-800">Product B approaching threshold</div>
                <div className="text-gray-600 mt-1">Current: 320, Reorder: 350</div>
                <div className="text-gray-500 mt-1">5 hours ago</div>
              </div>
              <div className="border rounded-md p-2 bg-blue-50 text-xs">
                <div className="font-medium text-blue-800">Lead time increased for Product E</div>
                <div className="text-gray-600 mt-1">Previous: 6 days, Current: 7 days</div>
                <div className="text-gray-500 mt-1">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">Safety Stock Dashboard</h2>
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
                <span className="text-sm">Service Level</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{serviceLevel}%</span>
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 hover:bg-green-200">
                  +2%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm flex-1">
            <CardContent className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Stockout Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stockoutRisk}%</span>
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 hover:bg-green-200">
                  -1.5%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Current Safety Stock</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-blue-600">2,450</span>
                <span className="text-gray-500">units</span>
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 hover:bg-green-200">
                  +5%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Average Lead Time</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-blue-600">5.2</span>
                <span className="text-gray-500">days</span>
                <Badge variant="secondary" className="ml-auto bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  +0.3
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Holding Cost</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-blue-600">49,000</span>
                <span className="text-gray-500">USD</span>
                <Badge variant="secondary" className="ml-auto bg-red-100 text-red-800 hover:bg-red-200">
                  +8%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Inventory Turnover</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-blue-600">12.4</span>
                <span className="text-gray-500">times/year</span>
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 hover:bg-green-200">
                  +0.8
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardHeader className="p-4 flex-row items-center justify-between border-b">
              <CardTitle className="text-sm font-medium">Product Safety Stock Analysis</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ArrowsMaximize className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Product
                      <div className="mt-1">
                        <Input
                          placeholder="Filter"
                          className="h-8 text-xs"
                          value={filters.product}
                          onChange={(e) => handleFilterChange("product", e.target.value)}
                        />
                      </div>
                    </TableHead>
                    <TableHead>
                      Current Stock
                      <div className="mt-1">
                        <Input
                          placeholder="Filter"
                          className="h-8 text-xs"
                          value={filters.currentStock}
                          onChange={(e) => handleFilterChange("currentStock", e.target.value)}
                        />
                      </div>
                    </TableHead>
                    <TableHead>
                      Safety Stock
                      <div className="mt-1">
                        <Input
                          placeholder="Filter"
                          className="h-8 text-xs"
                          value={filters.safetyStock}
                          onChange={(e) => handleFilterChange("safetyStock", e.target.value)}
                        />
                      </div>
                    </TableHead>
                    <TableHead>
                      Reorder Point
                      <div className="mt-1">
                        <Input
                          placeholder="Filter"
                          className="h-8 text-xs"
                          value={filters.reorderPoint}
                          onChange={(e) => handleFilterChange("reorderPoint", e.target.value)}
                        />
                      </div>
                    </TableHead>
                    <TableHead>
                      Lead Time (days)
                      <div className="mt-1">
                        <Input
                          placeholder="Filter"
                          className="h-8 text-xs"
                          value={filters.leadTime}
                          onChange={(e) => handleFilterChange("leadTime", e.target.value)}
                        />
                      </div>
                    </TableHead>
                    <TableHead>
                      Service Level (%)
                      <div className="mt-1">
                        <Input
                          placeholder="Filter"
                          className="h-8 text-xs"
                          value={filters.serviceLevel}
                          onChange={(e) => handleFilterChange("serviceLevel", e.target.value)}
                        />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.product}</TableCell>
                        <TableCell>{product.currentStock}</TableCell>
                        <TableCell>{product.safetyStock}</TableCell>
                        <TableCell>{product.reorderPoint}</TableCell>
                        <TableCell>{product.leadTime}</TableCell>
                        <TableCell>{product.serviceLevel}</TableCell>
                        <TableCell>
                          {product.currentStock > product.reorderPoint ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">OK</Badge>
                          ) : product.currentStock > product.safetyStock ? (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Order Soon</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Order Now</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        No results match your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="p-4 flex-row items-center justify-between border-b">
              <CardTitle className="text-sm font-medium">Safety Stock vs Actual Inventory</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ArrowsMaximize className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={safetyStockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={450} stroke="red" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="safetyStock"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="actualInventory"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <div className="p-2 border-t flex items-center justify-between text-xs text-gray-500">
              <div>Chart items visible: 3 of 3</div>
              <div className="flex items-center gap-2">
                <span>Drag to zoom</span>
                <List className="h-4 w-4" />
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="p-4 flex-row items-center justify-between border-b">
              <CardTitle className="text-sm font-medium">Safety Stock by Product</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ArrowsMaximize className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="product" type="category" />
                    <Tooltip />
                    <Bar dataKey="safetyStock" fill="#8884d8" name="Safety Stock" />
                    <Bar dataKey="currentStock" fill="#82ca9d" name="Current Stock" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <div className="p-2 border-t flex items-center justify-between text-xs text-gray-500">
              <div>Chart items visible: 2 of 2</div>
              <div className="flex items-center gap-2">
                <span>Drag to zoom</span>
                <List className="h-4 w-4" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
