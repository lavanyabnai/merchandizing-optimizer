"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon, BoxIcon, PackageIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { MrpState } from "@/components/snop/mrp/types"

interface ModelInputsProps {
  mrpState: MrpState
  onInputChange: (newState: Partial<MrpState>) => void
}

export function ModelInputs({ mrpState, onInputChange }: ModelInputsProps) {
  const handleEndItemParamChange = (key: keyof typeof mrpState.endItem, value: number) => {
    onInputChange({
      endItem: {
        ...mrpState.endItem,
        [key]: value,
      },
    })
  }

  const handleComponentParamChange = (key: keyof typeof mrpState.component, value: number) => {
    onInputChange({
      component: {
        ...mrpState.component,
        [key]: value,
      },
    })
  }

  const handleEndItemGrossReqChange = (index: number, value: number) => {
    const newGrossReq = [...mrpState.endItem.grossRequirements]
    newGrossReq[index] = value
    onInputChange({
      endItem: {
        ...mrpState.endItem,
        grossRequirements: newGrossReq,
      },
    })
  }

  const handleEndItemBegInvChange = (index: number, value: number) => {
    const newBegInv = [...mrpState.endItem.beginningInventory]
    newBegInv[index] = value
    onInputChange({
      endItem: {
        ...mrpState.endItem,
        beginningInventory: newBegInv,
      },
    })
  }

  const handleComponentBegInvChange = (index: number, value: number) => {
    const newBegInv = [...mrpState.component.beginningInventory]
    newBegInv[index] = value
    onInputChange({
      component: {
        ...mrpState.component,
        beginningInventory: newBegInv,
      },
    })
  }

  return (
    <div className="space-y-6">
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

        <TabsContent value="enditem" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800 flex items-center">
                End Item Parameters
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 ml-2 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[250px]">
                        These parameters define the constraints and costs for the end item manufacturer.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>Enter the basic parameters for the end item manufacturer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="endItemLeadTime">Lead Time (months)</Label>
                  <Input
                    id="endItemLeadTime"
                    type="number"
                    value={mrpState.endItem.leadTime}
                    onChange={(e) => handleEndItemParamChange("leadTime", Number(e.target.value))}
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endItemSetupCost">Setup Cost ($/order)</Label>
                  <Input
                    id="endItemSetupCost"
                    type="number"
                    value={mrpState.endItem.setupCost}
                    onChange={(e) => handleEndItemParamChange("setupCost", Number(e.target.value))}
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endItemHoldingCost">Holding Cost ($/month)</Label>
                  <Input
                    id="endItemHoldingCost"
                    type="number"
                    step="0.01"
                    value={mrpState.endItem.holdingCost}
                    onChange={(e) => handleEndItemParamChange("holdingCost", Number(e.target.value))}
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endItemCapacity">Production Capacity (units)</Label>
                  <Input
                    id="endItemCapacity"
                    type="number"
                    value={mrpState.endItem.capacity}
                    onChange={(e) => handleEndItemParamChange("capacity", Number(e.target.value))}
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">End Item Period Data</CardTitle>
              <CardDescription>Enter gross requirements and beginning inventory for each period</CardDescription>
            </CardHeader>
            <CardContent>
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
                        <TableCell key={index} className="p-0">
                          <Input
                            type="number"
                            value={req}
                            onChange={(e) => handleEndItemGrossReqChange(index, Number(e.target.value))}
                            className="border-0 text-center bg-gray-100 h-10"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Beginning Inventory</TableCell>
                      {mrpState.endItem.beginningInventory.map((inv, index) => (
                        <TableCell key={index} className="p-0">
                          <Input
                            type="number"
                            value={inv}
                            onChange={(e) => handleEndItemBegInvChange(index, Number(e.target.value))}
                            className="border-0 text-center bg-gray-100 h-10"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Capacity</TableCell>
                      {mrpState.periods.map((_, index) => (
                        <TableCell key={index} className="text-center">
                          {mrpState.endItem.capacity > 0 ? mrpState.endItem.capacity : 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="component" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-green-800 flex items-center">
                Component Parameters
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 ml-2 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[250px]">
                        These parameters define the constraints and costs for the component manufacturer.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>Enter the basic parameters for the component manufacturer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="componentLeadTime">Lead Time (months)</Label>
                  <Input
                    id="componentLeadTime"
                    type="number"
                    value={mrpState.component.leadTime}
                    onChange={(e) => handleComponentParamChange("leadTime", Number(e.target.value))}
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="componentQtyPerEndItem">Qty per End Item</Label>
                  <Input
                    id="componentQtyPerEndItem"
                    type="number"
                    value={mrpState.component.qtyPerEndItem}
                    onChange={(e) => handleComponentParamChange("qtyPerEndItem", Number(e.target.value))}
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="componentSetupCost">Setup Cost ($/order)</Label>
                  <Input
                    id="componentSetupCost"
                    type="number"
                    value={mrpState.component.setupCost}
                    onChange={(e) => handleComponentParamChange("setupCost", Number(e.target.value))}
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="componentHoldingCost">Holding Cost ($/month)</Label>
                  <Input
                    id="componentHoldingCost"
                    type="number"
                    step="0.01"
                    value={mrpState.component.holdingCost}
                    onChange={(e) => handleComponentParamChange("holdingCost", Number(e.target.value))}
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="componentCapacity">Production Capacity (units)</Label>
                  <Input
                    id="componentCapacity"
                    type="number"
                    value={mrpState.component.capacity}
                    onChange={(e) => handleComponentParamChange("capacity", Number(e.target.value))}
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-green-800">Component Period Data</CardTitle>
              <CardDescription>Enter beginning inventory for each period</CardDescription>
            </CardHeader>
            <CardContent>
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
                      <TableCell className="font-medium">Beginning Inventory</TableCell>
                      {mrpState.component.beginningInventory.map((inv, index) => (
                        <TableCell key={index} className="p-0">
                          <Input
                            type="number"
                            value={inv}
                            onChange={(e) => handleComponentBegInvChange(index, Number(e.target.value))}
                            className="border-0 text-center bg-gray-100 h-10"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Capacity</TableCell>
                      {mrpState.periods.map((_, index) => (
                        <TableCell key={index} className="text-center">
                          {mrpState.component.capacity > 0 ? mrpState.component.capacity : 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Component gross requirements are automatically calculated based on the end item
                  planned order releases and the quantity per end item.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
