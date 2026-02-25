"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NetworkData } from "./types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface OrderAnalysisProps {
  networkData: NetworkData
}

export function OrderAnalysis({ networkData }: OrderAnalysisProps) {
  // Prepare data for order frequency chart
  const orderFrequencyData = Array.from({ length: 8 }, (_, i) => i + 1).map((period) => {
    const periodIndex = period - 1

    // Count orders at each level for this period
    const centralOrder = networkData.centralWarehouse.periods[periodIndex]?.plannedOrder ? 1 : 0

    const regionalOrders = networkData.regionalWarehouses.reduce((count, warehouse) => {
      return count + (warehouse.periods[periodIndex]?.plannedOrder ? 1 : 0)
    }, 0)

    return {
      period,
      central: centralOrder,
      regional: regionalOrders,
      total: centralOrder + regionalOrders,
    }
  })

  // Prepare data for order quantity chart
  const orderQuantityData = Array.from({ length: 8 }, (_, i) => i + 1).map((period) => {
    const periodIndex = period - 1

    // Sum order quantities at each level for this period
    const centralQty = networkData.centralWarehouse.periods[periodIndex]?.plannedOrder || 0

    const regionalQty = networkData.regionalWarehouses.reduce((sum, warehouse) => {
      return sum + (warehouse.periods[periodIndex]?.plannedOrder || 0)
    }, 0)

    return {
      period,
      central: centralQty,
      regional: regionalQty,
      total: centralQty + regionalQty,
    }
  })

  // Prepare data for the order roll-up table
  const rollUpData = Array.from({ length: 8 }, (_, i) => i + 1).map((period) => {
    const periodIndex = period - 1

    return {
      period,
      central: {
        usage: networkData.centralWarehouse.periods[periodIndex]?.periodUsage || 0,
        order: networkData.centralWarehouse.periods[periodIndex]?.plannedOrder || null,
      },
      regionOne: {
        usage: networkData.regionalWarehouses[0]?.periods[periodIndex]?.periodUsage || 0,
        order: networkData.regionalWarehouses[0]?.periods[periodIndex]?.plannedOrder || null,
      },
      regionTwo: {
        usage: networkData.regionalWarehouses[1]?.periods[periodIndex]?.periodUsage || 0,
        order: networkData.regionalWarehouses[1]?.periods[periodIndex]?.plannedOrder || null,
      },
      regionThree: {
        usage: networkData.regionalWarehouses[2]?.periods[periodIndex]?.periodUsage || 0,
        order: networkData.regionalWarehouses[2]?.periods[periodIndex]?.plannedOrder || null,
      },
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Order Roll-Up Analysis</CardTitle>
          <CardDescription>
            How regional warehouse orders roll up to become demand at the central warehouse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Period</TableHead>
                  {rollUpData.map((data) => (
                    <TableHead key={data.period} className="text-center">
                      {data.period}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium bg-blue-50">CENTRAL</TableCell>
                  <TableCell colSpan={8} className="bg-blue-50"></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium pl-6">Period Usage</TableCell>
                  {rollUpData.map((data) => (
                    <TableCell key={data.period} className="text-center">
                      {data.central.usage}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium pl-6">Planned Order</TableCell>
                  {rollUpData.map((data) => (
                    <TableCell key={data.period} className="text-center">
                      {data.central.order ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">{data.central.order}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-green-50">REGION ONE</TableCell>
                  <TableCell colSpan={8} className="bg-green-50"></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium pl-6">Period Usage</TableCell>
                  {rollUpData.map((data) => (
                    <TableCell key={data.period} className="text-center">
                      {data.regionOne.usage}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium pl-6">Planned Order</TableCell>
                  {rollUpData.map((data) => (
                    <TableCell key={data.period} className="text-center">
                      {data.regionOne.order ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">{data.regionOne.order}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-green-50">REGION TWO</TableCell>
                  <TableCell colSpan={8} className="bg-green-50"></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium pl-6">Period Usage</TableCell>
                  {rollUpData.map((data) => (
                    <TableCell key={data.period} className="text-center">
                      {data.regionTwo.usage}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium pl-6">Planned Order</TableCell>
                  {rollUpData.map((data) => (
                    <TableCell key={data.period} className="text-center">
                      {data.regionTwo.order ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">{data.regionTwo.order}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium bg-green-50">REGION THREE</TableCell>
                  <TableCell colSpan={8} className="bg-green-50"></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium pl-6">Period Usage</TableCell>
                  {rollUpData.map((data) => (
                    <TableCell key={data.period} className="text-center">
                      {data.regionThree.usage}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium pl-6">Planned Order</TableCell>
                  {rollUpData.map((data) => (
                    <TableCell key={data.period} className="text-center">
                      {data.regionThree.order ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">{data.regionThree.order}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Order Frequency</CardTitle>
            <CardDescription>Number of orders placed by period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer className="h-[300px] w-full"
                config={{
                  central: {
                    label: "Central Warehouse",
                    color: "hsl(var(--chart-1))",
                  },
                  regional: {
                    label: "Regional Warehouses",
                    color: "hsl(var(--chart-5))",
                  },
                  total: {
                    label: "Total Orders",
                    color: "hsl(var(--chart-4))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderFrequencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="central" name="Central Warehouse" fill="var(--color-central)" />
                    <Bar dataKey="regional" name="Regional Warehouses" fill="var(--color-regional)" />
                    <Bar dataKey="total" name="Total Orders" fill="var(--color-total)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Order Quantities</CardTitle>
            <CardDescription>Total units ordered by period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer className="h-[300px] w-full"
                config={{
                  central: {
                    label: "Central Warehouse",
                    color: "hsl(var(--chart-1))",
                  },
                  regional: {
                    label: "Regional Warehouses",
                    color: "hsl(var(--chart-5))",
                  },
                  total: {
                    label: "Total Quantity",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderQuantityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="central" name="Central Warehouse" fill="var(--color-central)" />
                    <Bar dataKey="regional" name="Regional Warehouses" fill="var(--color-regional)" />
                    <Bar dataKey="total" name="Total Quantity" fill="var(--color-total)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
