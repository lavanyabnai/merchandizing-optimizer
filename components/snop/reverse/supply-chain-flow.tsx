"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ReverseLogisticsModel, Facility, Flow } from "./types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RecycleIcon, WarehouseIcon, PackageIcon, CircleIcon } from "lucide-react"

interface SupplyChainFlowProps {
  model: ReverseLogisticsModel
}

interface NodeData extends Facility {
  inflow: number
  outflow: number
  position: { top: string; left: string }
}

interface FlowData {
  from: string
  to: string
  value: number
  type: "direct" | "through-sorting"
  cost: number
}

export function SupplyChainFlow({ model }: SupplyChainFlowProps) {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [selectedFlow, setSelectedFlow] = useState<FlowData | null>(null)
  const [showFlowValues, setShowFlowValues] = useState(true)
  const [showCosts, setShowCosts] = useState(false)

  // Calculate inflows and outflows for each node
  const calculateFlows = (facilities: Facility[], flows: Flow[]) => {
    const result: Record<string, { inflow: number; outflow: number }> = {}

    // Initialize with zeros
    facilities.forEach((facility) => {
      result[facility.id] = { inflow: 0, outflow: 0 }
    })

    // Calculate based on flows
    flows.forEach((flow) => {
      if (result[flow.from]) {
        result[flow.from].outflow += flow.quantity
      }
      if (result[flow.to]) {
        result[flow.to].inflow += flow.quantity
      }
    })

    return result
  }

  const flowsData = calculateFlows(model.facilities, model.flows)

  // Create node data from the model
  const nodes: NodeData[] = model.facilities.map((facility) => {
    const flows = flowsData[facility.id] || { inflow: 0, outflow: 0 }

    // Determine position based on facility type
    let position = { top: "50%", left: "50%" }
    if (facility.id.startsWith("cp-")) {
      // Collection points on the left
      const index = Number.parseInt(facility.id.split("-")[1])
      position = { top: `${20 + (index - 1) * 30}%`, left: "15%" }
    } else if (facility.id === "regional-sorting") {
      // Regional sorting in the middle
      position = { top: "50%", left: "50%" }
    } else if (facility.id.startsWith("recycling-")) {
      // Recycling facilities on the right
      const index = Number.parseInt(facility.id.split("-")[1])
      position = { top: `${30 + (index - 1) * 40}%`, left: "85%" }
    }

    return {
      ...facility,
      inflow: flows.inflow,
      outflow: flows.outflow,
      position,
    }
  })

  // Create flow data
  const flows: FlowData[] = model.flows.map((flow) => {
    const transportCost = model.transportCosts.find((tc) => tc.from === flow.from && tc.to === flow.to)

    // Determine if this is a direct flow or through sorting
    const type = flow.to === "regional-sorting" || flow.from === "regional-sorting" ? "through-sorting" : "direct"

    return {
      from: flow.from,
      to: flow.to,
      value: flow.quantity,
      type,
      cost: transportCost ? transportCost.cost * flow.quantity : 0,
    }
  })

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node)
  }

  const handleFlowClick = (flow: FlowData) => {
    setSelectedFlow(flow)
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "recycling":
        return <RecycleIcon className="w-12 h-12" />
      case "sorting":
        if (nodes.find((n) => n.id === "regional-sorting")?.id === selectedNode?.id) {
          return <WarehouseIcon className="w-12 h-12" />
        } else {
          return <PackageIcon className="w-12 h-12" />
        }
      default:
        return <CircleIcon className="w-12 h-12" />
    }
  }

  const getNodeColor = (type: string, isOpen?: boolean) => {
    if (isOpen === false) {
      return "bg-gray-100 text-gray-400 border-gray-300"
    }

    switch (type) {
      case "recycling":
        return "bg-green-100 text-green-800 border-green-300"
      case "sorting":
        if (nodes.find((n) => n.id === "regional-sorting")?.id === selectedNode?.id) {
          return "bg-blue-100 text-blue-800 border-blue-300"
        } else {
          return "bg-amber-100 text-amber-800 border-amber-300"
        }
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getFlowColor = (type: string) => {
    switch (type) {
      case "through-sorting":
        return "stroke-blue-600"
      case "direct":
        return "stroke-green-600 stroke-dashed"
      default:
        return "stroke-gray-400"
    }
  }

  const getFlowLabel = (flow: FlowData) => {
    if (!showFlowValues && !showCosts) return ""

    let label = ""
    if (showFlowValues) {
      label += `${flow.value} tons`
    }

    if (showCosts && flow.cost > 0) {
      if (showFlowValues) label += " | "
      label += `$${flow.cost.toFixed(0)}`
    }

    return label
  }

  const getFlowPath = (from: string, to: string) => {
    const fromNode = nodes.find((n) => n.id === from)
    const toNode = nodes.find((n) => n.id === to)

    if (!fromNode || !toNode) return ""

    // Convert percentage to viewport coordinates (assuming 1000x600 viewport)
    const x1 = Number.parseInt(fromNode.position.left) * 10
    const y1 = Number.parseInt(fromNode.position.top) * 6
    const x2 = Number.parseInt(toNode.position.left) * 10
    const y2 = Number.parseInt(toNode.position.top) * 6

    // For flows to/from regional sorting
    if (from === "regional-sorting" || to === "regional-sorting") {
      return `M${x1} ${y1} C${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`
    }

    // For direct flows from collection points to recycling
    return `M${x1} ${y1} C${x1 + 100} ${y1 + 50}, ${x2 - 100} ${y2 - 50}, ${x2} ${y2}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-green-800">Battery Recycling Network Flow</CardTitle>
            <CardDescription>Interactive visualization of the reverse logistics network</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showFlowValues ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFlowValues(!showFlowValues)}
            >
              {showFlowValues ? "Hide Flow Values" : "Show Flow Values"}
            </Button>
            <Button variant={showCosts ? "default" : "outline"} size="sm" onClick={() => setShowCosts(!showCosts)}>
              {showCosts ? "Hide Costs" : "Show Costs"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[600px] border rounded-lg bg-white overflow-hidden">
          {/* Column headers */}
          <div className="absolute top-4 left-[15%] transform -translate-x-1/2 text-center">
            <h3 className="font-bold text-amber-800">Collection Points</h3>
          </div>
          <div className="absolute top-4 left-[50%] transform -translate-x-1/2 text-center">
            <h3 className="font-bold text-blue-800">Regional Sorting</h3>
          </div>
          <div className="absolute top-4 left-[85%] transform -translate-x-1/2 text-center">
            <h3 className="font-bold text-green-800">Recycling Facilities</h3>
          </div>

          {/* SVG for flows */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>

            {/* Draw all flows */}
            {flows.map((flow, index) => (
              <g key={`flow-${index}`} onClick={() => handleFlowClick(flow)}>
                <path
                  d={getFlowPath(flow.from, flow.to)}
                  className={`${getFlowColor(flow.type)} fill-none stroke-2 cursor-pointer transition-all hover:stroke-[3px]`}
                  markerEnd={`url(#arrow)`}
                  strokeDasharray={flow.type === "direct" ? "5,5" : "none"}
                />

                {/* Flow label */}
                {getFlowLabel(flow) && (
                  <text className="text-xs fill-gray-700 pointer-events-none" dy="-5">
                    <textPath href={`#flow-path-${index}`} startOffset="50%" textAnchor="middle">
                      {getFlowLabel(flow)}
                    </textPath>
                  </text>
                )}

                {/* Invisible wider path for better click target */}
                <path
                  id={`flow-path-${index}`}
                  d={getFlowPath(flow.from, flow.to)}
                  className="fill-none stroke-transparent stroke-[10px] cursor-pointer"
                  onClick={() => handleFlowClick(flow)}
                />
              </g>
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <TooltipProvider key={node.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div
                        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg border-2 ${getNodeColor(node.type, node.isOpen)} transition-all hover:scale-105 shadow-sm hover:shadow-md`}
                        style={{
                          top: node.position.top,
                          left: node.position.left,
                        }}
                        onClick={() => handleNodeClick(node)}
                      >
                        <div className="flex flex-col items-center">
                          {getNodeIcon(node.type)}
                          <div className="mt-2 font-bold text-center">{node.name}</div>
                          {node.capacity > 0 && (
                            <Badge variant="outline" className="mt-1">
                              {node.collected}/{node.capacity} tons
                            </Badge>
                          )}
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{node.name} Details</DialogTitle>
                        <DialogDescription>
                          {node.type === "recycling"
                            ? "Recycling facility for processing used batteries"
                            : node.id === "regional-sorting"
                              ? "Regional storage and sorting depot"
                              : "Collection point for used batteries"}
                        </DialogDescription>
                      </DialogHeader>
                      <Tabs defaultValue="flows">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="flows">Flows</TabsTrigger>
                          <TabsTrigger value="costs">Costs</TabsTrigger>
                        </TabsList>
                        <TabsContent value="flows" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-md">
                              <div className="text-sm text-blue-600">Inflow</div>
                              <div className="text-xl font-bold">{node.inflow} tons</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-md">
                              <div className="text-sm text-green-600">Outflow</div>
                              <div className="text-xl font-bold">{node.outflow} tons</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium">Incoming Flows</h4>
                            <div className="space-y-1">
                              {flows
                                .filter((f) => f.to === node.id)
                                .map((flow, i) => (
                                  <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                    <span>From {nodes.find((n) => n.id === flow.from)?.name}</span>
                                    <span className="font-medium">{flow.value} tons</span>
                                  </div>
                                ))}
                              {flows.filter((f) => f.to === node.id).length === 0 && (
                                <div className="text-sm text-gray-500 italic">No incoming flows</div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium">Outgoing Flows</h4>
                            <div className="space-y-1">
                              {flows
                                .filter((f) => f.from === node.id)
                                .map((flow, i) => (
                                  <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                    <span>To {nodes.find((n) => n.id === flow.to)?.name}</span>
                                    <span className="font-medium">{flow.value} tons</span>
                                  </div>
                                ))}
                              {flows.filter((f) => f.from === node.id).length === 0 && (
                                <div className="text-sm text-gray-500 italic">No outgoing flows</div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="costs">
                          <div className="space-y-4">
                            {(node.type === "recycling" || node.id === "regional-sorting") && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-purple-50 p-3 rounded-md">
                                  <div className="text-sm text-purple-600">Fixed Cost</div>
                                  <div className="text-xl font-bold">${node.fixedCost}</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-md">
                                  <div className="text-sm text-purple-600">Variable Cost</div>
                                  <div className="text-xl font-bold">${(node.varCost * node.inflow).toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">${node.varCost}/ton</div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <h4 className="font-medium">Transport Costs</h4>
                              <div className="space-y-1">
                                {model.transportCosts
                                  .filter((tc) => tc.from === node.id || tc.to === node.id)
                                  .map((tc, i) => {
                                    const flow = flows.find((f) => f.from === tc.from && f.to === tc.to)
                                    const totalCost = flow ? tc.cost * flow.value : 0

                                    return (
                                      <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                        <span>
                                          {tc.from === node.id
                                            ? `To ${nodes.find((n) => n.id === tc.to)?.name}`
                                            : `From ${nodes.find((n) => n.id === tc.from)?.name}`}
                                        </span>
                                        <div className="text-right">
                                          <span className="font-medium">${totalCost.toFixed(2)}</span>
                                          <div className="text-xs text-gray-500">${tc.cost}/ton</div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                {model.transportCosts.filter((tc) => tc.from === node.id || tc.to === node.id)
                                  .length === 0 && (
                                  <div className="text-sm text-gray-500 italic">No transport costs</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{node.name}</p>
                  <p className="text-xs text-gray-500">
                    {node.type === "recycling"
                      ? "Recycling facility"
                      : node.id === "regional-sorting"
                        ? "Regional sorting depot"
                        : "Collection point"}
                  </p>
                  <p className="text-xs">Click for details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg border shadow-sm">
            <div className="text-sm font-medium mb-2">Legend</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-blue-600"></div>
                <span className="text-xs">Flow through Regional Sorting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-green-600" style={{ strokeDasharray: "5,5" }}></div>
                <span className="text-xs">Direct Flow to Recycling</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300"></div>
                <span className="text-xs">Collection Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div>
                <span className="text-xs">Regional Sorting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                <span className="text-xs">Recycling Facility</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flow details panel */}
        {selectedFlow && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Flow Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFlow(null)}>
                Close
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">From</div>
                <div className="font-medium">{nodes.find((n) => n.id === selectedFlow.from)?.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">To</div>
                <div className="font-medium">{nodes.find((n) => n.id === selectedFlow.to)?.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Volume</div>
                <div className="font-medium">{selectedFlow.value} tons</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Cost</div>
                <div className="font-medium">${selectedFlow.cost.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
