"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Info, Plus, Trash2, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface VariationParameter {
  id: string
  name: string
  baseValue: number
  minValue: number
  maxValue: number
  step: number
  unit: string
  enabled: boolean
}

export default function VariationExperiment() {
  const [experimentName, setExperimentName] = useState("New Variation Experiment")
  const [description, setDescription] = useState("")
  const [simulationRuns, setSimulationRuns] = useState(100)
  const [confidenceLevel, setConfidenceLevel] = useState(95)
  const [timeHorizon, setTimeHorizon] = useState(180)
  const [parameters, setParameters] = useState<VariationParameter[]>([
    {
      id: "param1",
      name: "Lead Time",
      baseValue: 14,
      minValue: 7,
      maxValue: 30,
      step: 1,
      unit: "days",
      enabled: true,
    },
    {
      id: "param2",
      name: "Demand Variability",
      baseValue: 0.2,
      minValue: 0.1,
      maxValue: 0.5,
      step: 0.05,
      unit: "coefficient",
      enabled: true,
    },
    {
      id: "param3",
      name: "Service Level Target",
      baseValue: 0.95,
      minValue: 0.8,
      maxValue: 0.99,
      step: 0.01,
      unit: "",
      enabled: true,
    },
  ])

  const [selectedMetrics, setSelectedMetrics] = useState([
    "service-level",
    "inventory-turns",
    "total-cost",
    "stockout-frequency",
  ])

  const availableMetrics = [
    { id: "service-level", name: "Service Level" },
    { id: "inventory-turns", name: "Inventory Turns" },
    { id: "total-cost", name: "Total Cost" },
    { id: "stockout-frequency", name: "Stockout Frequency" },
    { id: "lead-time", name: "Lead Time" },
    { id: "fill-rate", name: "Fill Rate" },
    { id: "inventory-value", name: "Inventory Value" },
    { id: "order-quantity", name: "Order Quantity" },
  ]

  const toggleMetric = (metricId: string) => {
    if (selectedMetrics.includes(metricId)) {
      setSelectedMetrics(selectedMetrics.filter((id) => id !== metricId))
    } else {
      setSelectedMetrics([...selectedMetrics, metricId])
    }
  }

  const toggleParameter = (paramId: string) => {
    setParameters(parameters.map((param) => (param.id === paramId ? { ...param, enabled: !param.enabled } : param)))
  }

  const updateParameterValue = (paramId: string, field: keyof VariationParameter, value: any) => {
    setParameters(parameters.map((param) => (param.id === paramId ? { ...param, [field]: value } : param)))
  }

  const addParameter = () => {
    const newParam: VariationParameter = {
      id: `param${parameters.length + 1}`,
      name: `Parameter ${parameters.length + 1}`,
      baseValue: 0,
      minValue: 0,
      maxValue: 100,
      step: 1,
      unit: "",
      enabled: true,
    }
    setParameters([...parameters, newParam])
  }

  const removeParameter = (paramId: string) => {
    setParameters(parameters.filter((param) => param.id !== paramId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the experiment configuration to your backend
    console.log({
      experimentName,
      description,
      simulationRuns,
      confidenceLevel,
      timeHorizon,
      parameters: parameters.filter((p) => p.enabled),
      selectedMetrics,
    })
    alert("Experiment configuration saved!")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Variation Experiment Settings</CardTitle>
          <CardDescription>
            Configure parameters to analyze how variations in key factors affect your supply chain performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="parameters">Variation Parameters</TabsTrigger>
              <TabsTrigger value="metrics">Output Metrics</TabsTrigger>
            </TabsList>

            {/* Basic Settings Tab */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experiment-name">Experiment Name</Label>
                  <Input
                    id="experiment-name"
                    value={experimentName}
                    onChange={(e) => setExperimentName(e.target.value)}
                    placeholder="Enter experiment name"
                  />
                </div>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter experiment description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="simulation-runs">Number of Simulation Runs</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">
                            Higher number of runs increases accuracy but takes longer to compute
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="simulation-runs"
                      min={10}
                      max={1000}
                      step={10}
                      value={[simulationRuns]}
                      onValueChange={(value) => setSimulationRuns(value[0])}
                    />
                    <span className="w-12 text-center">{simulationRuns}</span>
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

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="advanced-settings" />
                  <Label htmlFor="advanced-settings">Enable Advanced Settings</Label>
                </div>
              </div>
            </TabsContent>

            {/* Parameters Tab */}
            <TabsContent value="parameters" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Variation Parameters</h3>
                <Button type="button" variant="outline" size="sm" onClick={addParameter}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Parameter
                </Button>
              </div>

              <div className="space-y-4">
                {parameters.map((param) => (
                  <Card key={param.id} className={!param.enabled ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`enable-${param.id}`}
                            checked={param.enabled}
                            onCheckedChange={() => toggleParameter(param.id)}
                          />
                          <Input
                            className="w-48 font-medium"
                            value={param.name}
                            onChange={(e) => updateParameterValue(param.id, "name", e.target.value)}
                            disabled={!param.enabled}
                          />
                          <Input
                            className="w-20"
                            value={param.unit}
                            onChange={(e) => updateParameterValue(param.id, "unit", e.target.value)}
                            placeholder="Unit"
                            disabled={!param.enabled}
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeParameter(param.id)}>
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`base-${param.id}`}>Base Value</Label>
                          <Input
                            id={`base-${param.id}`}
                            type="number"
                            value={param.baseValue}
                            onChange={(e) =>
                              updateParameterValue(param.id, "baseValue", Number.parseFloat(e.target.value))
                            }
                            disabled={!param.enabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`min-${param.id}`}>Minimum Value</Label>
                          <Input
                            id={`min-${param.id}`}
                            type="number"
                            value={param.minValue}
                            onChange={(e) =>
                              updateParameterValue(param.id, "minValue", Number.parseFloat(e.target.value))
                            }
                            disabled={!param.enabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`max-${param.id}`}>Maximum Value</Label>
                          <Input
                            id={`max-${param.id}`}
                            type="number"
                            value={param.maxValue}
                            onChange={(e) =>
                              updateParameterValue(param.id, "maxValue", Number.parseFloat(e.target.value))
                            }
                            disabled={!param.enabled}
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label>Range</Label>
                        <div className="px-2">
                          <Slider
                            min={param.minValue}
                            max={param.maxValue}
                            step={param.step}
                            value={[param.minValue, param.baseValue, param.maxValue]}
                            disabled={!param.enabled}
                            onValueChange={(values) => {
                              updateParameterValue(param.id, "minValue", values[0])
                              updateParameterValue(param.id, "baseValue", values[1])
                              updateParameterValue(param.id, "maxValue", values[2])
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            {param.minValue}
                            {param.unit}
                          </span>
                          <span>
                            {param.baseValue}
                            {param.unit}
                          </span>
                          <span>
                            {param.maxValue}
                            {param.unit}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {parameters.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No parameters added yet</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addParameter}>
                      Add Parameter
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Output Metrics</Label>
                <p className="text-sm text-gray-500">Choose which metrics to track in your experiment results</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`metric-${metric.id}`}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => toggleMetric(metric.id)}
                    />
                    <Label htmlFor={`metric-${metric.id}`} className="cursor-pointer">
                      {metric.name}
                    </Label>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label>Selected Metrics</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedMetrics.length > 0 ? (
                    selectedMetrics.map((metricId) => {
                      const metric = availableMetrics.find((m) => m.id === metricId)
                      return (
                        <Badge key={metricId} variant="secondary" className="flex items-center gap-1">
                          {metric?.name}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => toggleMetric(metricId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No metrics selected</p>
                  )}
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
            <Button type="submit">Run Experiment</Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
