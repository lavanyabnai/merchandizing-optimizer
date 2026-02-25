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
import type { NetworkModel } from "./types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SupplyChainFlowProps {
  model: NetworkModel
}

interface NodeData {
  id: string
  name: string
  type: "cdc" | "id" | "store" | "home" | "aps"
  description: string
  inflow: number
  outflow: number
  cost: number
  isOpen?: boolean
}

interface FlowData {
  from: string
  to: string
  value: number
  type: "material" | "shopping" | "pickup"
  cost: number
}

export function SupplyChainFlow({ model }: SupplyChainFlowProps) {
  const [, setSelectedNode] = useState<NodeData | null>(null)
  const [selectedFlow, setSelectedFlow] = useState<FlowData | null>(null)
  const [showFlowValues, setShowFlowValues] = useState(true)
  const [showCosts, setShowCosts] = useState(false)

  // Create node data from the model
  const nodes: NodeData[] = [
    {
      id: "cdc",
      name: "CDC",
      type: "cdc",
      description: "City Distribution Center",
      inflow: 0,
      outflow: model.totalDemand,
      cost: 0,
    },
    {
      id: "id1",
      name: "ID 1",
      type: "id",
      description: "Intermediate Depot 1",
      inflow: model.intermediateDepots[0].flowFromCDC,
      outflow: model.intermediateDepots[0].flowFromCDC,
      cost:
        model.intermediateDepots[0].fixedCost +
        model.intermediateDepots[0].varCost * model.intermediateDepots[0].flowFromCDC,
      isOpen: model.intermediateDepots[0].isOpen,
    },
    {
      id: "id2",
      name: "ID 2",
      type: "id",
      description: "Intermediate Depot 2",
      inflow: model.intermediateDepots[1].flowFromCDC,
      outflow: model.intermediateDepots[1].flowFromCDC,
      cost:
        model.intermediateDepots[1].fixedCost +
        model.intermediateDepots[1].varCost * model.intermediateDepots[1].flowFromCDC,
      isOpen: model.intermediateDepots[1].isOpen,
    },
    {
      id: "conv-store",
      name: "Conv. Store",
      type: "store",
      description: "Convenience Store",
      inflow: model.channelFlows[0].delivered,
      outflow: model.channelFlows[0].delivered,
      cost: model.channelFlows[0].varCost * model.channelFlows[0].delivered,
    },
    {
      id: "retail-store",
      name: "Retail Store",
      type: "store",
      description: "Retail Store",
      inflow: model.channelFlows[1].delivered,
      outflow: model.channelFlows[1].delivered,
      cost: model.channelFlows[1].varCost * model.channelFlows[1].delivered,
    },
    {
      id: "aps",
      name: "APS",
      type: "aps",
      description: "Automated Package Station",
      inflow: model.channelFlows[2].delivered,
      outflow: model.channelFlows[2].delivered,
      cost: model.channelFlows[2].varCost * model.channelFlows[2].delivered,
    },
    {
      id: "home",
      name: "Home/Office",
      type: "home",
      description: "Home or Office Delivery",
      inflow: model.channelFlows[3].delivered,
      outflow: 0, // End of chain
      cost: model.channelFlows[3].varCost * model.channelFlows[3].delivered,
    },
  ]

  // Create flow data
  const flows: FlowData[] = [
    // Material flows from CDC to IDs
    {
      from: "cdc",
      to: "id1",
      value: model.intermediateDepots[0].flowFromCDC,
      type: "material" as const,
      cost: model.intermediateDepots[0].transportCost * model.intermediateDepots[0].flowFromCDC,
    },
    {
      from: "cdc",
      to: "id2",
      value: model.intermediateDepots[1].flowFromCDC,
      type: "material" as const,
      cost: model.intermediateDepots[1].transportCost * model.intermediateDepots[1].flowFromCDC,
    },

    // Material flows from CDC to delivery points
    {
      from: "cdc",
      to: "conv-store",
      value: model.channelFlows[0].fromCDC,
      type: "material" as const,
      cost: model.transportCosts[0].convStore * model.channelFlows[0].fromCDC,
    },
    {
      from: "cdc",
      to: "retail-store",
      value: model.channelFlows[1].fromCDC,
      type: "material" as const,
      cost: model.transportCosts[0].retailStore * model.channelFlows[1].fromCDC,
    },
    {
      from: "cdc",
      to: "aps",
      value: model.channelFlows[2].fromCDC,
      type: "material" as const,
      cost: model.transportCosts[0].aps * model.channelFlows[2].fromCDC,
    },
    {
      from: "cdc",
      to: "home",
      value: model.channelFlows[3].fromCDC,
      type: "material" as const,
      cost: model.transportCosts[0].home * model.channelFlows[3].fromCDC,
    },

    // Material flows from ID1 to delivery points
    {
      from: "id1",
      to: "conv-store",
      value: model.channelFlows[0].fromID1,
      type: "material" as const,
      cost: model.transportCosts[1].convStore * model.channelFlows[0].fromID1,
    },
    {
      from: "id1",
      to: "retail-store",
      value: model.channelFlows[1].fromID1,
      type: "material" as const,
      cost: model.transportCosts[1].retailStore * model.channelFlows[1].fromID1,
    },
    {
      from: "id1",
      to: "aps",
      value: model.channelFlows[2].fromID1,
      type: "material" as const,
      cost: model.transportCosts[1].aps * model.channelFlows[2].fromID1,
    },

    // Material flows from ID2 to delivery points
    {
      from: "id2",
      to: "conv-store",
      value: model.channelFlows[0].fromID2,
      type: "material" as const,
      cost: model.transportCosts[2].convStore * model.channelFlows[0].fromID2,
    },
    {
      from: "id2",
      to: "aps",
      value: model.channelFlows[2].fromID2,
      type: "material" as const,
      cost: model.transportCosts[2].aps * model.channelFlows[2].fromID2,
    },
    {
      from: "id2",
      to: "home",
      value: model.channelFlows[3].fromID2,
      type: "material" as const,
      cost: model.transportCosts[2].home * model.channelFlows[3].fromID2,
    },

    // Customer shopping options
    {
      from: "home",
      to: "retail-store",
      value: Math.round(model.channelFlows[1].delivered * 0.3), // Estimated shopping flow
      type: "shopping" as const,
      cost: 0,
    },
    {
      from: "home",
      to: "conv-store",
      value: Math.round(model.channelFlows[0].delivered * 0.2), // Estimated shopping flow
      type: "shopping" as const,
      cost: 0,
    },

    // Customer pickup options
    {
      from: "retail-store",
      to: "home",
      value: Math.round(model.channelFlows[1].delivered * 0.4), // Estimated pickup flow
      type: "pickup" as const,
      cost: 0,
    },
    {
      from: "conv-store",
      to: "home",
      value: Math.round(model.channelFlows[0].delivered * 0.5), // Estimated pickup flow
      type: "pickup" as const,
      cost: 0,
    },
    {
      from: "aps",
      to: "home",
      value: Math.round(model.channelFlows[2].delivered * 0.8), // Estimated pickup flow
      type: "pickup" as const,
      cost: 0,
    },
  ].filter((flow) => flow.value > 0) // Only include flows with values > 0

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node)
  }

  const handleFlowClick = (flow: FlowData) => {
    setSelectedFlow(flow)
  }

  const getNodePosition = (id: string) => {
    switch (id) {
      case "cdc":
        return { top: "50%", left: "10%" }
      case "id1":
        return { top: "30%", left: "30%" }
      case "id2":
        return { top: "70%", left: "30%" }
      case "conv-store":
        return { top: "20%", left: "55%" }
      case "retail-store":
        return { top: "50%", left: "55%" }
      case "aps":
        return { top: "80%", left: "55%" }
      case "home":
        return { top: "50%", left: "80%" }
      default:
        return { top: "50%", left: "50%" }
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "cdc":
        return (
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="14" stroke="currentColor" strokeWidth="2" />
            <rect x="5" y="9" width="4" height="3" fill="currentColor" />
            <rect x="10" y="9" width="4" height="3" fill="currentColor" />
            <rect x="15" y="9" width="4" height="3" fill="currentColor" />
            <rect x="5" y="14" width="4" height="3" fill="currentColor" />
            <rect x="10" y="14" width="4" height="3" fill="currentColor" />
            <rect x="15" y="14" width="4" height="3" fill="currentColor" />
          </svg>
        )
      case "id":
        return (
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="18" height="12" stroke="currentColor" strokeWidth="2" />
            <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" />
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="2" />
          </svg>
        )
      case "store":
        return (
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6L3 20H21V6" stroke="currentColor" strokeWidth="2" />
            <path d="M3 6L5 2H19L21 6" stroke="currentColor" strokeWidth="2" />
            <path d="M9 20V14H15V20" stroke="currentColor" strokeWidth="2" />
            <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
          </svg>
        )
      case "aps":
        return (
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="7" y="8" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        )
      case "home":
        return (
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10.5V20H21V10.5" stroke="currentColor" strokeWidth="2" />
            <path d="M12 3L2 10.5L12 18L22 10.5L12 3Z" stroke="currentColor" strokeWidth="2" />
            <rect x="9" y="13" width="6" height="7" stroke="currentColor" strokeWidth="2" />
          </svg>
        )
      default:
        return null
    }
  }

  const getNodeColor = (type: string, isOpen?: boolean) => {
    if (type === "id" && isOpen === false) {
      return "bg-gray-100 text-gray-400 border-gray-300"
    }

    switch (type) {
      case "cdc":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "id":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "store":
        return "bg-red-100 text-red-800 border-red-300"
      case "aps":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "home":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getFlowColor = (type: string) => {
    switch (type) {
      case "material":
        return "stroke-blue-600"
      case "shopping":
        return "stroke-green-600 stroke-dashed"
      case "pickup":
        return "stroke-orange-600 stroke-dasharray-2"
      default:
        return "stroke-gray-400"
    }
  }

  const getFlowLabel = (flow: FlowData) => {
    if (!showFlowValues && !showCosts) return ""

    let label = ""
    if (showFlowValues) {
      label += `${flow.value} boxes`
    }

    if (showCosts && flow.cost > 0) {
      if (showFlowValues) label += " | "
      label += `$${flow.cost.toFixed(0)}`
    }

    return label
  }

  const getFlowPath = (from: string, to: string) => {
    const fromPos = getNodePosition(from)
    const toPos = getNodePosition(to)

    // Convert percentage to viewport coordinates (assuming 1000x600 viewport)
    const x1 = Number.parseInt(fromPos.left) * 10
    const y1 = Number.parseInt(fromPos.top) * 6
    const x2 = Number.parseInt(toPos.left) * 10
    const y2 = Number.parseInt(toPos.top) * 6

    // For material flows (usually horizontal)
    if (from === "cdc" || from.startsWith("id")) {
      return `M${x1} ${y1} C${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`
    }

    // For shopping flows (usually from home to store)
    if (from === "home" && (to.includes("store") || to === "aps")) {
      return `M${x1} ${y1} C${x1 - 100} ${y1}, ${x2 - 100} ${y2}, ${x2} ${y2}`
    }

    // For pickup flows (usually from store to home)
    if ((from.includes("store") || from === "aps") && to === "home") {
      return `M${x1} ${y1} C${x1 + 50} ${y1 - 50}, ${x2 - 50} ${y2 - 50}, ${x2} ${y2}`
    }

    // Default curved path
    return `M${x1} ${y1} C${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-purple-800">Omni-Channel Supply Chain Flow</CardTitle>
            <CardDescription>Interactive visualization of the supply chain network</CardDescription>
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
              <marker
                id="arrow-dashed"
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
                  strokeDasharray={flow.type === "shopping" ? "5,5" : flow.type === "pickup" ? "2,2" : "none"}
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
                          top: getNodePosition(node.id).top,
                          left: getNodePosition(node.id).left,
                        }}
                        onClick={() => handleNodeClick(node)}
                      >
                        <div className="flex flex-col items-center">
                          {getNodeIcon(node.type)}
                          <div className="mt-2 font-bold text-center">{node.name}</div>
                          {node.type === "id" && (
                            <Badge className={node.isOpen ? "bg-purple-500" : "bg-gray-400"}>
                              {node.isOpen ? "OPEN" : "CLOSED"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{node.name} Details</DialogTitle>
                        <DialogDescription>{node.description}</DialogDescription>
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
                              <div className="text-xl font-bold">{node.inflow} boxes</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-md">
                              <div className="text-sm text-green-600">Outflow</div>
                              <div className="text-xl font-bold">{node.outflow} boxes</div>
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
                                    <span className="font-medium">{flow.value} boxes</span>
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
                                    <span className="font-medium">{flow.value} boxes</span>
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
                            {node.type === "id" && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-purple-50 p-3 rounded-md">
                                  <div className="text-sm text-purple-600">Fixed Cost</div>
                                  <div className="text-xl font-bold">
                                    ${node.isOpen ? model.intermediateDepots[node.id === "id1" ? 0 : 1].fixedCost : 0}
                                  </div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-md">
                                  <div className="text-sm text-purple-600">Variable Cost</div>
                                  <div className="text-xl font-bold">
                                    $
                                    {(node.isOpen
                                      ? model.intermediateDepots[node.id === "id1" ? 0 : 1].varCost * node.inflow
                                      : 0
                                    ).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="bg-blue-50 p-3 rounded-md">
                              <div className="text-sm text-blue-600">Total Operating Cost</div>
                              <div className="text-xl font-bold">${node.cost.toFixed(2)}</div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium">Transport Costs</h4>
                              <div className="space-y-1">
                                {flows
                                  .filter((f) => (f.from === node.id || f.to === node.id) && f.cost > 0)
                                  .map((flow, i) => (
                                    <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                      <span>
                                        {flow.from === node.id
                                          ? `To ${nodes.find((n) => n.id === flow.to)?.name}`
                                          : `From ${nodes.find((n) => n.id === flow.from)?.name}`}
                                      </span>
                                      <span className="font-medium">${flow.cost.toFixed(2)}</span>
                                    </div>
                                  ))}
                                {flows.filter((f) => (f.from === node.id || f.to === node.id) && f.cost > 0).length ===
                                  0 && <div className="text-sm text-gray-500 italic">No transport costs</div>}
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
                  <p className="text-xs text-gray-500">{node.description}</p>
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
                <span className="text-xs">Material Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-green-600" style={{ strokeDasharray: "5,5" }}></div>
                <span className="text-xs">Customer Shopping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-orange-600" style={{ strokeDasharray: "2,2" }}></div>
                <span className="text-xs">Customer Pickup</span>
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
                <div className="font-medium">{selectedFlow.value} boxes</div>
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
