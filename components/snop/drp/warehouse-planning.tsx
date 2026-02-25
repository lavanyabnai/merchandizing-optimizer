"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { NetworkData } from "./types"
import { WarehouseIcon } from "lucide-react"

interface WarehousePlanningProps {
  networkData: NetworkData
}

export function WarehousePlanning({ networkData }: WarehousePlanningProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="central" className="space-y-4">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="central" className="flex items-center gap-2">
            <WarehouseIcon className="h-4 w-4" />
            Central Warehouse
          </TabsTrigger>
          {networkData.regionalWarehouses.map((warehouse, index) => (
            <TabsTrigger key={index} value={`region${index + 1}`} className="flex items-center gap-2">
              <WarehouseIcon className="h-4 w-4" />
              {warehouse.name.split(" ").pop()}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="central">
          <WarehouseTable
            warehouse={networkData.centralWarehouse}
            headerBgClass="bg-blue-50"
            headerTextClass="text-blue-800"
          />
        </TabsContent>

        {networkData.regionalWarehouses.map((_warehouse, index) => (
          <TabsContent key={index} value={`region${index + 1}`}>
            <WarehouseTable
              warehouse={networkData.regionalWarehouses[index]}
              headerBgClass="bg-green-50"
              headerTextClass="text-green-800"
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

interface WarehouseTableProps {
  warehouse: NetworkData["centralWarehouse"] | NetworkData["regionalWarehouses"][0]
  headerBgClass: string
  headerTextClass: string
}

function WarehouseTable({ warehouse, headerBgClass, headerTextClass }: WarehouseTableProps) {
  return (
    <Card>
      <CardHeader className={`${headerBgClass}`}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className={`text-xl ${headerTextClass}`}>{warehouse.name}</CardTitle>
            <CardDescription>
              Order Quantity (Q): {warehouse.orderQuantity} | Safety Stock (SS): {warehouse.safetyStock} | Lead Time
              (LT): {warehouse.leadTime} weeks
            </CardDescription>
          </div>
          <Badge variant="outline" className={`${headerBgClass} ${headerTextClass} border-current`}>
            DRP Table
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Period</TableHead>
                <TableHead className="text-center">NOW</TableHead>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((period) => (
                  <TableHead key={period} className="text-center">
                    {period}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Period Usage</TableCell>
                <TableCell className="text-center bg-gray-50">-</TableCell>
                {warehouse.periods.map((period, index) => (
                  <TableCell key={index} className="text-center bg-gray-50">
                    {period.periodUsage}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Gross Requirements</TableCell>
                <TableCell className="text-center">-</TableCell>
                {warehouse.periods.map((period, index) => (
                  <TableCell key={index} className="text-center">
                    {period.grossRequirements}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Beginning Inventory</TableCell>
                <TableCell className="text-center bg-gray-50">{warehouse.periods[0]?.endingInventory || "-"}</TableCell>
                {warehouse.periods.map((period, index) => (
                  <TableCell key={index} className="text-center bg-gray-50">
                    {period.beginningInventory}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Scheduled Receipts</TableCell>
                <TableCell className="text-center">-</TableCell>
                {warehouse.periods.map((period, index) => (
                  <TableCell key={index} className="text-center">
                    {period.scheduledReceipts}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Net Requirements</TableCell>
                <TableCell className="text-center bg-gray-50">-</TableCell>
                {warehouse.periods.map((period, index) => (
                  <TableCell key={index} className="text-center bg-gray-50">
                    {period.netRequirements !== null ? period.netRequirements : "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Planned Receipts</TableCell>
                <TableCell className="text-center">-</TableCell>
                {warehouse.periods.map((period, index) => (
                  <TableCell key={index} className="text-center">
                    {period.plannedReceipts !== null ? period.plannedReceipts : "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Ending Inventory</TableCell>
                <TableCell className="text-center bg-gray-50">
                  {warehouse.periods[0]?.beginningInventory || "-"}
                </TableCell>
                {warehouse.periods.map((period, index) => (
                  <TableCell key={index} className="text-center bg-gray-50">
                    {period.endingInventory}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Planned Order Release</TableCell>
                <TableCell className="text-center">-</TableCell>
                {warehouse.periods.map((period, index) => (
                  <TableCell key={index} className="text-center font-bold">
                    {period.plannedOrder !== null ? period.plannedOrder : "-"}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
