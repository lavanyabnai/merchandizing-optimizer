"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { NetworkModel } from "./types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

interface TransportCostsProps {
  model: NetworkModel
}

export function TransportCosts({ model }: TransportCostsProps) {
  // Prepare data for transport cost comparison chart

  // Calculate total transport costs
  const totalTransportCost = model.costBreakdown.idTransport + model.costBreakdown.podTransport

  // Calculate transport cost by channel
  const channelTransportCosts = model.channelFlows.map((flow) => {
    let cost = 0

    // Calculate based on source and destination
    model.transportCosts.forEach((tc) => {
      if (tc.from === "CDC") {
        if (flow.channelName === "Conv. Store") cost += flow.fromCDC * tc.convStore
        else if (flow.channelName === "Retail Store") cost += flow.fromCDC * tc.retailStore
        else if (flow.channelName === "APS") cost += flow.fromCDC * tc.aps
        else if (flow.channelName === "Home") cost += flow.fromCDC * tc.home
      } else if (tc.from === "ID 1") {
        if (flow.channelName === "Conv. Store") cost += flow.fromID1 * tc.convStore
        else if (flow.channelName === "Retail Store") cost += flow.fromID1 * tc.retailStore
        else if (flow.channelName === "APS") cost += flow.fromID1 * tc.aps
        else if (flow.channelName === "Home") cost += flow.fromID1 * tc.home
      } else if (tc.from === "ID 2") {
        if (flow.channelName === "Conv. Store") cost += flow.fromID2 * tc.convStore
        else if (flow.channelName === "Retail Store") cost += flow.fromID2 * tc.retailStore
        else if (flow.channelName === "APS") cost += flow.fromID2 * tc.aps
        else if (flow.channelName === "Home") cost += flow.fromID2 * tc.home
      }
    })

    return {
      name: flow.channelName,
      cost: cost,
      volume: flow.delivered,
      costPerUnit: cost / flow.delivered,
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">Total Transport Cost</CardTitle>
            <CardDescription>Combined ID and POD transport</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">${totalTransportCost.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">ID Transport</CardTitle>
            <CardDescription>CDC to intermediate depots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">${model.costBreakdown.idTransport.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">POD Transport</CardTitle>
            <CardDescription>To points of delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${model.costBreakdown.podTransport.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-purple-800">Transport Cost Matrix</CardTitle>
          <CardDescription>Cost per unit for each source-destination pair</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Conv. Store</TableHead>
                  <TableHead>Retail Store</TableHead>
                  <TableHead>APS</TableHead>
                  <TableHead>Home</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.transportCosts.map((cost, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{cost.from}</TableCell>
                    <TableCell>
                      {cost.convStore >= 999 ? (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          N/A
                        </Badge>
                      ) : (
                        `$${cost.convStore.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {cost.retailStore >= 999 ? (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          N/A
                        </Badge>
                      ) : (
                        `$${cost.retailStore.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {cost.aps >= 999 ? (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          N/A
                        </Badge>
                      ) : (
                        `$${cost.aps.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {cost.home >= 999 ? (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          N/A
                        </Badge>
                      ) : (
                        `$${cost.home.toFixed(2)}`
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-purple-800">Transport Cost by Channel</CardTitle>
          <CardDescription>Comparison of transport costs across delivery channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ChartContainer
              config={{
                cost: {
                  label: "Total Cost",
                  color: "hsl(var(--chart-1))",
                },
                volume: {
                  label: "Volume",
                  color: "hsl(var(--chart-2))",
                },
                costPerUnit: {
                  label: "Cost per Unit",
                  color: "hsl(var(--chart-3))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelTransportCosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="cost" name="Total Cost" fill="var(--color-cost)" />
                  <Bar yAxisId="left" dataKey="volume" name="Volume" fill="var(--color-volume)" />
                  <Bar yAxisId="right" dataKey="costPerUnit" name="Cost per Unit" fill="var(--color-costPerUnit)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
