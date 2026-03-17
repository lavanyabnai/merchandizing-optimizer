"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MrpState } from "@/components/snop/mrp/types"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BoxIcon, PackageIcon, ArrowDownIcon, TruckIcon, FactoryIcon } from "lucide-react"

interface SupplyChainVisualizationProps {
  mrpState: MrpState
}

export function SupplyChainVisualization({ mrpState }: SupplyChainVisualizationProps) {
  // Calculate total production and demand
  const totalEndItemProduction = mrpState.endItem.dueIn.reduce((sum, qty) => sum + qty, 0)
  const totalEndItemDemand = mrpState.endItem.grossRequirements.reduce((sum, qty) => sum + qty, 0)
  const totalComponentProduction = mrpState.component.dueIn.reduce((sum, qty) => sum + qty, 0)
  const totalComponentDemand = mrpState.component.grossRequirements.reduce((sum, qty) => sum + qty, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Supply Chain Structure</CardTitle>
          <CardDescription>Visual representation of the multi-level supply chain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center w-80">
                <BoxIcon className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-800">End Item Manufacturer</h3>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-sm text-blue-600">Lead Time</p>
                    <p className="font-bold text-blue-800">{mrpState.endItem.leadTime} months</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-sm text-blue-600">Capacity</p>
                    <p className="font-bold text-blue-800">{mrpState.endItem.capacity} units</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <Badge className="bg-blue-500">Production: {totalEndItemProduction}</Badge>
                  <Badge className="bg-blue-700">Demand: {totalEndItemDemand}</Badge>
                </div>
              </div>
            </div>

            <ArrowDownIcon className="h-12 w-12 text-gray-400 my-2" />

            <div className="flex flex-col items-center">
              <div className="bg-green-100 border border-green-300 rounded-lg p-6 text-center w-80">
                <PackageIcon className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <h3 className="text-lg font-bold text-green-800">Component Manufacturer</h3>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-sm text-green-600">Lead Time</p>
                    <p className="font-bold text-green-800">{mrpState.component.leadTime} months</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-sm text-green-600">Capacity</p>
                    <p className="font-bold text-green-800">{mrpState.component.capacity} units</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <Badge className="bg-green-500">Production: {totalComponentProduction}</Badge>
                  <Badge className="bg-green-700">Demand: {totalComponentDemand}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-100 p-4 rounded-lg w-full max-w-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Bill of Materials</h3>
              <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                <div className="flex items-center">
                  <BoxIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-gray-800">End Item</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-800 mr-2">Requires</span>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    {mrpState.component.qtyPerEndItem} components
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="flowchart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flowchart">Process Flow</TabsTrigger>
          <TabsTrigger value="timeline">Production Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="flowchart">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-purple-800">Supply Chain Process Flow</CardTitle>
              <CardDescription>End-to-end process visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between py-8 px-4 space-y-8 md:space-y-0 md:space-x-4">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <FactoryIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-purple-800">Component Production</h3>
                  <p className="text-sm text-gray-600 mt-1">Lead Time: {mrpState.component.leadTime} months</p>
                </div>

                <div className="h-0 w-12 border-t-2 border-gray-300 md:h-2 md:w-full md:border-t-2 md:border-gray-300"></div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <TruckIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-blue-800">Component Inventory</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Holding Cost: ${mrpState.component.holdingCost}/unit/month
                  </p>
                </div>

                <div className="h-0 w-12 border-t-2 border-gray-300 md:h-2 md:w-full md:border-t-2 md:border-gray-300"></div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <FactoryIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-green-800">End Item Assembly</h3>
                  <p className="text-sm text-gray-600 mt-1">Lead Time: {mrpState.endItem.leadTime} months</p>
                </div>

                <div className="h-0 w-12 border-t-2 border-gray-300 md:h-2 md:w-full md:border-t-2 md:border-gray-300"></div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                    <TruckIcon className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-amber-800">End Item Inventory</h3>
                  <p className="text-sm text-gray-600 mt-1">Holding Cost: ${mrpState.endItem.holdingCost}/unit/month</p>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Key Constraints</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Badge className="mr-2 bg-blue-100 text-blue-800 border-blue-300">End Item</Badge>
                    <span>Production capacity limited to {mrpState.endItem.capacity} units per period</span>
                  </li>
                  <li className="flex items-center">
                    <Badge className="mr-2 bg-green-100 text-green-800 border-green-300">Component</Badge>
                    <span>Production capacity limited to {mrpState.component.capacity} units per period</span>
                  </li>
                  <li className="flex items-center">
                    <Badge className="mr-2 bg-purple-100 text-purple-800 border-purple-300">BOM</Badge>
                    <span>Each end item requires {mrpState.component.qtyPerEndItem} component units</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Production Timeline</CardTitle>
              <CardDescription>Visualization of production timing across the supply chain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="flex mb-2">
                    <div className="w-32 flex-shrink-0"></div>
                    {mrpState.periods.map((period) => (
                      <div
                        key={period}
                        className="flex-1 text-center font-bold border-r border-gray-200 last:border-r-0"
                      >
                        {period}
                      </div>
                    ))}
                  </div>

                  <div className="mb-8">
                    <div className="w-32 flex-shrink-0 font-bold text-blue-800 mb-2">End Item</div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 text-sm text-gray-600">Production</div>
                      {mrpState.endItem.dueIn.map((qty, index) => (
                        <div key={index} className="flex-1 text-center border-r border-gray-200 last:border-r-0 py-2">
                          {qty > 0 ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300">{qty}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 text-sm text-gray-600">Demand</div>
                      {mrpState.endItem.grossRequirements.map((qty, index) => (
                        <div key={index} className="flex-1 text-center border-r border-gray-200 last:border-r-0 py-2">
                          {qty > 0 ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300">{qty}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="w-32 flex-shrink-0 font-bold text-green-800 mb-2">Component</div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 text-sm text-gray-600">Production</div>
                      {mrpState.component.dueIn.map((qty, index) => (
                        <div key={index} className="flex-1 text-center border-r border-gray-200 last:border-r-0 py-2">
                          {qty > 0 ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">{qty}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 text-sm text-gray-600">Demand</div>
                      {mrpState.component.grossRequirements.map((qty, index) => (
                        <div key={index} className="flex-1 text-center border-r border-gray-200 last:border-r-0 py-2">
                          {qty > 0 ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-300">{qty}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
