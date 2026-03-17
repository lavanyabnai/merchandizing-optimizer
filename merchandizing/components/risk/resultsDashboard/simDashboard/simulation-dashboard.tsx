"use client"

import { useState } from "react"
import {
  ChevronDown,
  Plus,
  Settings,
  Search,
  ZoomIn,
  ArrowRightIcon as ArrowsMaximize,
  RefreshCw,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function SimulationDashboard() {
  const [serviceByOrders, ] = useState(83.5)
  const [serviceByProducts, ] = useState(85.2)
  const [timeToRecover, ] = useState(70)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Result Dashboard</h2>
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
          <Button size="sm" className="h-9">
            <Plus className="mr-1 h-4 w-4" />
            New Experiment
          </Button>
        </div>
      </div>

      {/* Service Level Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="shadow-none">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-medium text-sm">Service Level by Orders</span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center">
                <span className="font-medium text-sm">{serviceByOrders / 100}</span>
                <span className="ml-1 text-xs text-gray-500">/ N/A</span>
              </div>
            </div>
            <Progress value={serviceByOrders} className="h-1" />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-medium text-sm">Service Level by Products</span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center">
                <span className="font-medium text-sm">{serviceByProducts / 100}</span>
                <span className="ml-1 text-xs text-gray-500">/ N/A</span>
              </div>
            </div>
            <Progress value={serviceByProducts} className="h-1" />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-medium text-sm">Total Time to Recover</span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center">
                <span className="font-medium text-sm">0.7 day</span>
                <span className="ml-1 text-xs text-gray-500">/ N/A</span>
              </div>
            </div>
            <Progress value={timeToRecover} className="h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* History by Replication Chart */}
        <Card className="shadow-none">
          <CardHeader className="p-4 flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-medium">History by Replication</CardTitle>
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
              <div className="h-full w-full flex items-end justify-between gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-blue-500 w-full"
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      maxWidth: "8px",
                    }}
                  ></div>
                ))}
              </div>
              <div className="mt-4 w-full bg-blue-100 h-4 relative">
                <div className="absolute left-1/3 top-0 bottom-0 border-r-2 border-blue-500"></div>
              </div>
            </div>
          </CardContent>
          <div className="p-2 border-t flex items-center justify-between text-xs text-gray-500">
            <div>Chart items visible: 10 of 10</div>
            <div className="flex items-center gap-2">
              <span>Drag to zoom</span>
              <List className="h-4 w-4" />
            </div>
          </div>
        </Card>

        {/* Best-Mean-Worst Chart */}
        <Card className="shadow-none">
          <CardHeader className="p-4 flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-medium">Best-Mean-Worst</CardTitle>
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
              <div className="h-full w-full flex items-end justify-between gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-purple-500 w-full"
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      maxWidth: "8px",
                    }}
                  ></div>
                ))}
              </div>
              <div className="mt-4 w-full bg-purple-100 h-4 relative">
                <div className="absolute left-1/2 top-0 bottom-0 border-r-2 border-purple-500"></div>
              </div>
            </div>
          </CardContent>
          <div className="p-2 border-t flex items-center justify-between text-xs text-gray-500">
            <div>Chart items visible: 10 of 10</div>
            <div className="flex items-center gap-2">
              <span>Drag to zoom</span>
              <List className="h-4 w-4" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
