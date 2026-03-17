"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Info, AlertCircle, Plus, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SimulationExperiment() {
  const [simulationRuns, setSimulationRuns] = useState(100)
  const [timeHorizon, setTimeHorizon] = useState(180)
  const [confidenceLevel, setConfidenceLevel] = useState(95)
  const [simulationType, setSimulationType] = useState("standard")
  const [disruptionType, setDisruptionType] = useState("none")

  // Render different layouts based on simulation type
  const renderSimulationTypeContent = () => {
    switch (simulationType) {
      case "standard":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time-horizon">Time Horizon (Days)</Label>
                <Input
                  id="time-horizon"
                  type="number"
                  min={1}
                  max={365}
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replications">Number of Replications</Label>
                <Input
                  id="replications"
                  type="number"
                  min={1}
                  max={1000}
                  value={simulationRuns}
                  onChange={(e) => setSimulationRuns(Number.parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="confidence-level">Confidence Level (%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Statistical confidence level for the experiment results</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={confidenceLevel.toString()}
                onValueChange={(value) => setConfidenceLevel(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select confidence level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                    <SelectItem value="99">99%</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "monte-carlo":
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-blue-50">
              <h3 className="font-medium text-blue-700 mb-2">Monte Carlo Simulation Settings</h3>
              <p className="text-sm text-gray-600 mb-4">
                Monte Carlo simulations use random sampling to obtain numerical results and understand the impact of
                risk and uncertainty.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iterations">Number of Iterations</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="iterations"
                      min={100}
                      max={10000}
                      step={100}
                      value={[simulationRuns]}
                      onValueChange={(value) => setSimulationRuns(value[0])}
                    />
                    <span className="w-16 text-center">{simulationRuns}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distribution">Distribution Type</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue placeholder="Select distribution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="uniform">Uniform</SelectItem>
                        <SelectItem value="triangular">Triangular</SelectItem>
                        <SelectItem value="lognormal">Log-normal</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label>Random Seed</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="42" className="w-32" />
                  <Button variant="outline" size="sm">
                    Randomize
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case "discrete-event":
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-purple-50">
              <h3 className="font-medium text-purple-700 mb-2">Discrete Event Simulation Settings</h3>
              <p className="text-sm text-gray-600 mb-4">
                Discrete event simulation models the operation of a system as a sequence of events in time.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Event Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="event-arrival" defaultChecked />
                      <Label htmlFor="event-arrival">Arrival Events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="event-process" defaultChecked />
                      <Label htmlFor="event-process">Processing Events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="event-departure" defaultChecked />
                      <Label htmlFor="event-departure">Departure Events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="event-failure" />
                      <Label htmlFor="event-failure">Failure Events</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Queue Discipline</Label>
                  <RadioGroup defaultValue="fifo">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fifo" id="fifo" />
                      <Label htmlFor="fifo">First In, First Out (FIFO)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lifo" id="lifo" />
                      <Label htmlFor="lifo">Last In, First Out (LIFO)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="priority" id="priority" />
                      <Label htmlFor="priority">Priority Based</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
            <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500">Select a simulation type to configure settings</p>
          </div>
        )
    }
  }

  // Render different disruption settings based on disruption type
  const renderDisruptionContent = () => {
    switch (disruptionType) {
      case "none":
        return (
          <div className="p-4 border border-dashed rounded-lg">
            <p className="text-center text-gray-500">No disruptions configured for this simulation</p>
          </div>
        )

      case "supply":
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-amber-50">
              <h3 className="font-medium text-amber-700 mb-2">Supply Chain Disruptions</h3>

              <div className="space-y-4">
                <div className="border rounded p-3 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Supplier Shutdown</h4>
                      <p className="text-sm text-gray-500">Supplier temporarily unable to fulfill orders</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Start Day</Label>
                      <Input type="number" defaultValue="45" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (Days)</Label>
                      <Input type="number" defaultValue="14" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Severity (%)</Label>
                      <Input type="number" defaultValue="80" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Affected Suppliers</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Suppliers</SelectItem>
                          <SelectItem value="asia">Asian Suppliers</SelectItem>
                          <SelectItem value="europe">European Suppliers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Disruption
                </Button>
              </div>
            </div>
          </div>
        )

      case "demand":
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-red-50">
              <h3 className="font-medium text-red-700 mb-2">Demand Disruptions</h3>

              <div className="space-y-4">
                <div className="border rounded p-3 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Demand Spike</h4>
                      <p className="text-sm text-gray-500">Sudden increase in customer demand</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Start Day</Label>
                      <Input type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (Days)</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Magnitude (%)</Label>
                      <Input type="number" defaultValue="150" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Affected Products</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Products</SelectItem>
                          <SelectItem value="seasonal">Seasonal Products</SelectItem>
                          <SelectItem value="premium">Premium Products</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Disruption
                </Button>
              </div>
            </div>
          </div>
        )

      case "transportation":
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-indigo-50">
              <h3 className="font-medium text-indigo-700 mb-2">Transportation Disruptions</h3>

              <div className="space-y-4">
                <div className="border rounded p-3 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Port Congestion</h4>
                      <p className="text-sm text-gray-500">Delays in shipping due to port congestion</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Start Day</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (Days)</Label>
                      <Input type="number" defaultValue="45" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Delay Factor</Label>
                      <Input type="number" defaultValue="2.5" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Affected Routes</Label>
                      <Select defaultValue="asia-us">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Routes</SelectItem>
                          <SelectItem value="asia-us">Asia to US</SelectItem>
                          <SelectItem value="europe-us">Europe to US</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Disruption
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
            <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500">Select a disruption type to configure settings</p>
          </div>
        )
    }
  }

  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulation Experiment Settings</CardTitle>
          <CardDescription>Configure parameters for your supply chain simulation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="events">Events & Disruptions</TabsTrigger>
              <TabsTrigger value="outputs">Output Metrics</TabsTrigger>
            </TabsList>

            {/* Basic Settings Tab */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="simulation-type">Simulation Type</Label>
                  <Select value={simulationType} onValueChange={setSimulationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select simulation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="standard">Standard Simulation</SelectItem>
                        <SelectItem value="monte-carlo">Monte Carlo Simulation</SelectItem>
                        <SelectItem value="discrete-event">Discrete Event Simulation</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {renderSimulationTypeContent()}
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disruption-type">Disruption Type</Label>
                  <Select value={disruptionType} onValueChange={setDisruptionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disruption type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">No Disruptions</SelectItem>
                        <SelectItem value="supply">Supply Chain Disruptions</SelectItem>
                        <SelectItem value="demand">Demand Disruptions</SelectItem>
                        <SelectItem value="transportation">Transportation Disruptions</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {renderDisruptionContent()}
              </div>
            </TabsContent>

            {/* Outputs Tab */}
            <TabsContent value="outputs" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Output Metrics</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-service" defaultChecked />
                      <Label htmlFor="metric-service">Service Level</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-inventory" defaultChecked />
                      <Label htmlFor="metric-inventory">Inventory Levels</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-cost" defaultChecked />
                      <Label htmlFor="metric-cost">Total Cost</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-leadtime" defaultChecked />
                      <Label htmlFor="metric-leadtime">Lead Time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-stockout" />
                      <Label htmlFor="metric-stockout">Stockout Frequency</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-utilization" />
                      <Label htmlFor="metric-utilization">Resource Utilization</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-throughput" />
                      <Label htmlFor="metric-throughput">Throughput</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-revenue" />
                      <Label htmlFor="metric-revenue">Revenue</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <RadioGroup defaultValue="summary">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="summary" id="summary" />
                      <Label htmlFor="summary">Summary Statistics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed">Detailed Time Series</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both">Both Summary and Time Series</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit">Run Simulation</Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
