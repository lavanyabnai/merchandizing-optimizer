"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NetworkData } from "./types"
import { FactoryIcon, WarehouseIcon, StoreIcon, ArrowDownIcon } from "lucide-react"

interface NetworkViewProps {
  networkData: NetworkData
}

export function NetworkView({ networkData }: NetworkViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Distribution Network Structure</CardTitle>
          <CardDescription>Visual representation of the multi-echelon distribution network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            {/* Plant */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center w-80">
                <FactoryIcon className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-800">{networkData.plant.name}</h3>
              </div>
            </div>

            <ArrowDownIcon className="h-12 w-12 text-gray-400 my-2" />

            {/* Central Warehouse */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center w-80">
                <WarehouseIcon className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-800">{networkData.centralWarehouse.name}</h3>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-sm text-blue-600">Order Qty (Q)</p>
                    <p className="font-bold text-blue-800">{networkData.centralWarehouse.orderQuantity}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-sm text-blue-600">Safety Stock</p>
                    <p className="font-bold text-blue-800">{networkData.centralWarehouse.safetyStock}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-sm text-blue-600">Lead Time</p>
                    <p className="font-bold text-blue-800">{networkData.centralWarehouse.leadTime} weeks</p>
                  </div>
                </div>
              </div>
            </div>

            <ArrowDownIcon className="h-12 w-12 text-gray-400 my-2" />

            {/* Regional Warehouses */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {networkData.regionalWarehouses.map((warehouse, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center w-64">
                    <WarehouseIcon className="h-10 w-10 mx-auto mb-2 text-green-600" />
                    <h3 className="text-md font-bold text-green-800">{warehouse.name}</h3>
                    <div className="grid grid-cols-3 gap-1 mt-3">
                      <div className="bg-green-50 p-1 rounded text-xs">
                        <p className="text-green-600">Q</p>
                        <p className="font-bold text-green-800">{warehouse.orderQuantity}</p>
                      </div>
                      <div className="bg-green-50 p-1 rounded text-xs">
                        <p className="text-green-600">SS</p>
                        <p className="font-bold text-green-800">{warehouse.safetyStock}</p>
                      </div>
                      <div className="bg-green-50 p-1 rounded text-xs">
                        <p className="text-green-600">LT</p>
                        <p className="font-bold text-green-800">{warehouse.leadTime} wk</p>
                      </div>
                    </div>
                  </div>

                  <ArrowDownIcon className="h-8 w-8 text-gray-400 my-2" />

                  {/* Retailers */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {warehouse.retailers?.map((retailer, idx) => (
                      <Badge key={idx} className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                        <StoreIcon className="h-3 w-3" />
                        {retailer}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="flowchart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flowchart">Process Flow</TabsTrigger>
          <TabsTrigger value="timeline">Order Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="flowchart">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-purple-800">Distribution Process Flow</CardTitle>
              <CardDescription>End-to-end process visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between py-8 px-4 space-y-8 md:space-y-0 md:space-x-4">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <FactoryIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-800">Production</h3>
                  <p className="text-sm text-gray-600 mt-1">Manufacturing</p>
                </div>

                <div className="h-0 w-12 border-t-2 border-gray-300 md:h-2 md:w-full md:border-t-2 md:border-gray-300"></div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <WarehouseIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-blue-800">Central Warehouse</h3>
                  <p className="text-sm text-gray-600 mt-1">Lead Time: {networkData.centralWarehouse.leadTime} weeks</p>
                </div>

                <div className="h-0 w-12 border-t-2 border-gray-300 md:h-2 md:w-full md:border-t-2 md:border-gray-300"></div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <WarehouseIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-green-800">Regional Warehouses</h3>
                  <p className="text-sm text-gray-600 mt-1">Lead Time: 1 week</p>
                </div>

                <div className="h-0 w-12 border-t-2 border-gray-300 md:h-2 md:w-full md:border-t-2 md:border-gray-300"></div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                    <StoreIcon className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-amber-800">Retailers</h3>
                  <p className="text-sm text-gray-600 mt-1">Point of Sale</p>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Key Constraints</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Badge className="mr-2 bg-blue-100 text-blue-800 border-blue-300">Central</Badge>
                    <span>Order Quantity: {networkData.centralWarehouse.orderQuantity} units</span>
                  </li>
                  {networkData.regionalWarehouses.map((warehouse, index) => (
                    <li key={index} className="flex items-center">
                      <Badge className="mr-2 bg-green-100 text-green-800 border-green-300">
                        {warehouse.name.split(" ").pop()}
                      </Badge>
                      <span>
                        Order Quantity: {warehouse.orderQuantity} units, Safety Stock: {warehouse.safetyStock} units
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Order Timeline</CardTitle>
              <CardDescription>Visualization of order timing across the distribution network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="flex mb-2">
                    <div className="w-32 flex-shrink-0"></div>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((period) => (
                      <div
                        key={period}
                        className="flex-1 text-center font-bold border-r border-gray-200 last:border-r-0"
                      >
                        {period}
                      </div>
                    ))}
                  </div>

                  <div className="mb-8">
                    <div className="w-32 flex-shrink-0 font-bold text-blue-800 mb-2">Central</div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 text-sm text-gray-600">Period Usage</div>
                      {networkData.centralWarehouse.periods.map((period, index) => (
                        <div key={index} className="flex-1 text-center border-r border-gray-200 last:border-r-0 py-2">
                          {period.periodUsage}
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 text-sm text-gray-600">Planned Order</div>
                      {networkData.centralWarehouse.periods.map((period, index) => (
                        <div key={index} className="flex-1 text-center border-r border-gray-200 last:border-r-0 py-2">
                          {period.plannedOrder ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300">{period.plannedOrder}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {networkData.regionalWarehouses.map((warehouse, warehouseIndex) => (
                    <div key={warehouseIndex} className="mb-8">
                      <div className="w-32 flex-shrink-0 font-bold text-green-800 mb-2">
                        {warehouse.name.split(" ").pop()}
                      </div>
                      <div className="flex">
                        <div className="w-32 flex-shrink-0 text-sm text-gray-600">Period Usage</div>
                        {warehouse.periods.map((period, index) => (
                          <div key={index} className="flex-1 text-center border-r border-gray-200 last:border-r-0 py-2">
                            {period.periodUsage}
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <div className="w-32 flex-shrink-0 text-sm text-gray-600">Planned Order</div>
                        {warehouse.periods.map((period, index) => (
                          <div key={index} className="flex-1 text-center border-r border-gray-200 last:border-r-0 py-2">
                            {period.plannedOrder ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                {period.plannedOrder}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
