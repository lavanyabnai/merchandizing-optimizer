"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BoxIcon, PackageIcon } from "lucide-react"
import type { MrpState } from "@/components/snop/mrp/types"

interface OptimizationResultsProps {
  mrpState: MrpState
}

export function OptimizationResults({ mrpState }: OptimizationResultsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-blue-800">Optimization Results</CardTitle>
              <CardDescription>Decision variables and calculated values from the model</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Decision Variables
              </Badge>
              <Badge variant="outline" className="bg-white text-gray-800 border-gray-300">
                Calculated Values
              </Badge>
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                Input Values
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="enditem" className="space-y-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="enditem" className="flex items-center gap-2">
                <BoxIcon className="h-4 w-4" />
                End Item Manufacturer
              </TabsTrigger>
              <TabsTrigger value="component" className="flex items-center gap-2">
                <PackageIcon className="h-4 w-4" />
                Tier 1 Component Manufacturer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enditem">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      {mrpState.periods.map((period) => (
                        <TableHead key={period} className="text-center">
                          {period}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Gross Requirements</TableCell>
                      {mrpState.endItem.grossRequirements.map((req, index) => (
                        <TableCell key={index} className="text-center bg-gray-100">
                          {req}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Beginning Inventory</TableCell>
                      {mrpState.endItem.beginningInventory.map((inv, index) => (
                        <TableCell key={index} className="text-center bg-gray-100">
                          {inv}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <span className="flex items-center">
                          Due In
                          <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">Decision</Badge>
                        </span>
                      </TableCell>
                      {mrpState.endItem.dueIn.map((qty, index) => (
                        <TableCell key={index} className="text-center bg-yellow-50 font-medium">
                          {qty}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Capacity</TableCell>
                      {mrpState.periods.map((_, index) => (
                        <TableCell key={index} className="text-center bg-gray-100">
                          {mrpState.endItem.capacity}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Ending Inventory</TableCell>
                      {mrpState.endItem.endingInventory.map((inv, index) => (
                        <TableCell key={index} className="text-center">
                          {inv}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Planned Order Release</TableCell>
                      {mrpState.endItem.plannedOrderRelease.map((qty, index) => (
                        <TableCell key={index} className="text-center">
                          {qty}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="component">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      {mrpState.periods.map((period) => (
                        <TableHead key={period} className="text-center">
                          {period}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Gross Requirements</TableCell>
                      {mrpState.component.grossRequirements.map((req, index) => (
                        <TableCell key={index} className="text-center">
                          {req}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Beginning Inventory</TableCell>
                      {mrpState.component.beginningInventory.map((inv, index) => (
                        <TableCell key={index} className="text-center bg-gray-100">
                          {inv}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <span className="flex items-center">
                          Due In
                          <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">Decision</Badge>
                        </span>
                      </TableCell>
                      {mrpState.component.dueIn.map((qty, index) => (
                        <TableCell key={index} className="text-center bg-yellow-50 font-medium">
                          {qty}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Capacity</TableCell>
                      {mrpState.periods.map((_, index) => (
                        <TableCell key={index} className="text-center bg-gray-100">
                          {mrpState.component.capacity}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Ending Inventory</TableCell>
                      {mrpState.component.endingInventory.map((inv, index) => (
                        <TableCell key={index} className="text-center">
                          {inv}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Planned Order Release</TableCell>
                      {mrpState.component.plannedOrderRelease.map((qty, index) => (
                        <TableCell key={index} className="text-center">
                          {qty}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Cost Summary</CardTitle>
          <CardDescription>Breakdown of costs by level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total System Cost</p>
                  <p className="text-3xl font-bold text-blue-700">${mrpState.totalSystemCost.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">End Item Cost</p>
                  <p className="text-3xl font-bold text-green-700">${mrpState.endItem.totalCost.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Component Cost</p>
                  <p className="text-3xl font-bold text-purple-700">${mrpState.component.totalCost.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
