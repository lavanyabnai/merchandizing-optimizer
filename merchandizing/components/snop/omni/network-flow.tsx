"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { NetworkModel } from "./types"
import { FactoryIcon, WarehouseIcon, ShoppingBagIcon, HomeIcon, PackageIcon, ArrowDownIcon } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

interface NetworkFlowProps {
  model: NetworkModel
}

export function NetworkFlow({ model }: NetworkFlowProps) {
  // Prepare data for flow visualization

  // Prepare data for channel comparison chart
  const channelComparisonData = model.channelFlows.map((flow) => ({
    name: flow.channelName,
    delivered: flow.delivered,
    demanded: flow.demanded,
    utilization: (flow.delivered / flow.demanded) * 100,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-purple-800">Network Flow Visualization</CardTitle>
          <CardDescription>Visual representation of the omni-channel distribution network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            {/* CDC */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center w-80">
                <FactoryIcon className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-800">Central Distribution Center</h3>
                <div className="mt-4 flex justify-between">
                  <Badge className="bg-gray-500">Total Outflow: {model.totalDemand} boxes</Badge>
                </div>
              </div>
            </div>

            <ArrowDownIcon className="h-12 w-12 text-gray-400 my-2" />

            {/* Intermediate Depots */}
            <div className="flex flex-wrap justify-center gap-12 mb-8">
              {model.intermediateDepots.map((depot, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`${depot.isOpen ? "bg-purple-100 border-purple-300" : "bg-gray-100 border-gray-300"} border rounded-lg p-4 text-center w-64`}
                  >
                    <WarehouseIcon
                      className={`h-10 w-10 mx-auto mb-2 ${depot.isOpen ? "text-purple-600" : "text-gray-400"}`}
                    />
                    <h3 className={`text-md font-bold ${depot.isOpen ? "text-purple-800" : "text-gray-400"}`}>
                      {depot.id}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className={`${depot.isOpen ? "bg-purple-50" : "bg-gray-50"} p-2 rounded text-xs`}>
                        <p className={depot.isOpen ? "text-purple-600" : "text-gray-400"}>Fixed Cost</p>
                        <p className={`font-bold ${depot.isOpen ? "text-purple-800" : "text-gray-400"}`}>
                          ${depot.fixedCost}
                        </p>
                      </div>
                      <div className={`${depot.isOpen ? "bg-purple-50" : "bg-gray-50"} p-2 rounded text-xs`}>
                        <p className={depot.isOpen ? "text-purple-600" : "text-gray-400"}>Var Cost</p>
                        <p className={`font-bold ${depot.isOpen ? "text-purple-800" : "text-gray-400"}`}>
                          ${depot.varCost}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Badge className={depot.isOpen ? "bg-purple-500" : "bg-gray-300"}>
                        {depot.isOpen ? "OPEN" : "CLOSED"}
                      </Badge>
                      {depot.isOpen && <Badge className="bg-blue-500 ml-2">Flow: {depot.flowFromCDC} boxes</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <ArrowDownIcon className="h-12 w-12 text-gray-400 my-2" />

            {/* Delivery Channels */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center w-48">
                  <ShoppingBagIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="text-md font-bold text-blue-800">Conv. Store</h3>
                  <div className="mt-3">
                    <Badge className="bg-blue-500">{model.channelFlows[0].delivered} boxes</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 text-center w-48">
                  <ShoppingBagIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="text-md font-bold text-purple-800">Retail Store</h3>
                  <div className="mt-3">
                    <Badge className="bg-purple-500">{model.channelFlows[1].delivered} boxes</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 text-center w-48">
                  <PackageIcon className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <h3 className="text-md font-bold text-amber-800">APS</h3>
                  <div className="mt-3">
                    <Badge className="bg-amber-500">{model.channelFlows[2].delivered} boxes</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center w-48">
                  <HomeIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="text-md font-bold text-green-800">Home</h3>
                  <div className="mt-3">
                    <Badge className="bg-green-500">{model.channelFlows[3].delivered} boxes</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-purple-800">Channel Comparison</CardTitle>
          <CardDescription>Comparison of delivery volumes across different channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ChartContainer
              config={{
                delivered: {
                  label: "Delivered Volume",
                  color: "hsl(var(--chart-1))",
                },
                demanded: {
                  label: "Demanded Volume",
                  color: "hsl(var(--chart-2))",
                },
                utilization: {
                  label: "Utilization %",
                  color: "hsl(var(--chart-3))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="delivered" name="Delivered Volume" fill="var(--color-delivered)" />
                  <Bar yAxisId="left" dataKey="demanded" name="Demanded Volume" fill="var(--color-demanded)" />
                  <Bar yAxisId="right" dataKey="utilization" name="Utilization %" fill="var(--color-utilization)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
