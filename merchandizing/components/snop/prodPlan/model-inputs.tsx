"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ModelState } from "@/lib/types"
import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ModelInputsProps {
  modelState: ModelState
  onInputChange: (newState: Partial<ModelState>) => void
}

export function ModelInputs({ modelState, onInputChange }: ModelInputsProps) {
  const handleParameterChange = (key: keyof ModelState, value: number) => {
    onInputChange({ [key]: value })
  }

  const handleDemandChange = (index: number, value: number) => {
    const newDemand = [...modelState.demand]
    newDemand[index] = value
    onInputChange({ demand: newDemand })
  }

  const handleBeginningInventoryChange = (index: number, value: number) => {
    const newBeginningInventory = [...modelState.beginningInventory]
    newBeginningInventory[index] = value
    onInputChange({ beginningInventory: newBeginningInventory })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 flex items-center">
            Model Parameters
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 ml-2 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[250px]">
                    These parameters define the core constraints and costs of your production model.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>Enter the basic parameters for your production planning model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="leadTime">Lead Time</Label>
              <Input
                id="leadTime"
                type="number"
                value={modelState.leadTime}
                onChange={(e) => handleParameterChange("leadTime", Number(e.target.value))}
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setupCost">Setup Cost ($)</Label>
              <Input
                id="setupCost"
                type="number"
                value={modelState.setupCostPerRun}
                onChange={(e) => handleParameterChange("setupCostPerRun", Number(e.target.value))}
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holdingCost">Holding Cost ($/item/month)</Label>
              <Input
                id="holdingCost"
                type="number"
                step="0.01"
                value={modelState.holdingCostPerItemMonth}
                onChange={(e) => handleParameterChange("holdingCostPerItemMonth", Number(e.target.value))}
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Production Capacity (units/month)</Label>
              <Input
                id="capacity"
                type="number"
                value={modelState.capacity}
                onChange={(e) => handleParameterChange("capacity", Number(e.target.value))}
                className="bg-gray-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Period Data</CardTitle>
          <CardDescription>Enter demand and beginning inventory for each period</CardDescription>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Demand</TableCell>
                  {modelState.demand.map((demand, index) => (
                    <TableCell key={index} className="p-0">
                      <Input
                        type="number"
                        value={demand}
                        onChange={(e) => handleDemandChange(index, Number(e.target.value))}
                        className="border-0 text-center bg-gray-100 h-10"
                      />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Beginning Inventory</TableCell>
                  {modelState.beginningInventory.map((inv, index) => (
                    <TableCell key={index} className="p-0">
                      <Input
                        type="number"
                        value={inv}
                        onChange={(e) => handleBeginningInventoryChange(index, Number(e.target.value))}
                        className="border-0 text-center bg-gray-100 h-10"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
