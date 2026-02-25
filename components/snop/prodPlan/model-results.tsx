"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ModelState } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface ModelResultsProps {
  modelState: ModelState
}

export function ModelResults({ modelState }: ModelResultsProps) {
  const totalSetupCost = modelState.setupCost.reduce((sum, cost) => sum + cost, 0)
  const totalHoldingCost = modelState.holdingCost.reduce((sum, cost) => sum + cost, 0)
  const grandTotal = totalSetupCost + totalHoldingCost

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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  {modelState.periods.map((period) => (
                    <TableHead key={period} className="text-center">
                      {period}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Demand</TableCell>
                  {modelState.demand.map((demand, index) => (
                    <TableCell key={index} className="text-center bg-gray-100">
                      {demand}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Beginning Inventory</TableCell>
                  {modelState.beginningInventory.map((inv, index) => (
                    <TableCell key={index} className="text-center bg-gray-100">
                      {inv}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <span className="flex items-center">
                      Quantity to Make
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">Decision</Badge>
                    </span>
                  </TableCell>
                  {modelState.quantityToMake.map((qty, index) => (
                    <TableCell key={index} className="text-center bg-yellow-50 font-medium">
                      {qty}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <span className="flex items-center">
                      Order Setup
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">Decision</Badge>
                    </span>
                  </TableCell>
                  {modelState.orderSetup.map((setup, index) => (
                    <TableCell key={index} className="text-center bg-yellow-50 font-medium">
                      {setup}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Capacity</TableCell>
                  {modelState.periods.map((_, index) => (
                    <TableCell key={index} className="text-center">
                      {modelState.capacity}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ending Inventory</TableCell>
                  {modelState.endingInventory.map((inv, index) => (
                    <TableCell key={index} className="text-center">
                      {inv}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Cost Summary</CardTitle>
          <CardDescription>Breakdown of costs by period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  {modelState.periods.map((period) => (
                    <TableHead key={period} className="text-center">
                      {period}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Setup Cost ($)</TableCell>
                  {modelState.setupCost.map((cost, index) => (
                    <TableCell key={index} className="text-center">
                      ${cost.toFixed(2)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">${totalSetupCost.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Holding Cost ($)</TableCell>
                  {modelState.holdingCost.map((cost, index) => (
                    <TableCell key={index} className="text-center">
                      ${cost.toFixed(2)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">${totalHoldingCost.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Cost ($)</TableCell>
                  {modelState.totalCost.map((cost, index) => (
                    <TableCell key={index} className="text-center font-semibold">
                      ${cost.toFixed(2)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold bg-blue-50">${grandTotal.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Setup Cost</p>
                  <p className="text-3xl font-bold text-blue-700">${totalSetupCost.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Holding Cost</p>
                  <p className="text-3xl font-bold text-blue-700">${totalHoldingCost.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Grand Total</p>
                  <p className="text-3xl font-bold text-blue-700">${grandTotal.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
