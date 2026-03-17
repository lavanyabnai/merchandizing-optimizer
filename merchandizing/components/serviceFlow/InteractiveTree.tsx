"use client"

import React, { useState, useCallback, useMemo } from "react"
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Button } from "@/components/ui/button"
import CustomNode from "@/components/serviceFlow/custom-node"

interface TreeNodeData extends Record<string, unknown> {
  name: string
  description?: string
  level: number
  hasChildren: boolean
  isExpanded: boolean
  parentId?: string
  nodeType: "root" | "category" | "leaf" | "subcategory" | "detail"
  colorScheme?: string
}

const nodeTypes = {
  customNode: CustomNode,
}

// Complete tree data structure with all detailed breakdowns
const treeStructure = {
  root: {
    name: "Service Level Losses",
    description: "Analysis of service level performance issues across the supply chain",
    nodeType: "root" as const,
    colorScheme: "default",
    children: ["execution", "short-term", "intermediate", "long-term"],
  },
  execution: {
    name: "Operational Execution",
    description: "Real-time operational issues affecting immediate service delivery",
    nodeType: "category" as const,
    colorScheme: "execution",
    children: ["distribution", "manufacturing", "order-mgmt"],
  },
  "short-term": {
    name: "Tactical Planning",
    description: "Short-term planning and deployment issues (~2 weeks horizon)",
    nodeType: "category" as const,
    colorScheme: "short-term",
    children: ["short-forecast", "deployment", "safety-stock"],
  },
  intermediate: {
    name: "Production Planning",
    description: "Medium-term production and capacity planning challenges (~5 weeks)",
    nodeType: "category" as const,
    colorScheme: "intermediate",
    children: ["long-forecast", "master-schedule"],
  },
  "long-term": {
    name: "Strategic Planning",
    description: "Long-term strategic alignment and capacity planning issues",
    nodeType: "category" as const,
    colorScheme: "long-term",
    children: ["strategic"],
  },

  // EXECUTION CATEGORY NODES
  distribution: {
    name: "Distribution & Transportation",
    description: "Distribution center operations and transportation logistics issues",
    nodeType: "leaf" as const,
    colorScheme: "execution",
    children: [
      "carrier-pickup",
      "trailers-not-processed",
      "age-of-stock",
      "pick-loading-error",
      "vehicle-capacity",
      "throughput-issues",
      "external-manufacturer",
    ],
  },
  manufacturing: {
    name: "Production Operations",
    description: "Manufacturing execution and production scheduling disruptions",
    nodeType: "leaf" as const,
    colorScheme: "execution",
    children: ["no-plant-shutdown", "plant-shutdown"],
  },
  "order-mgmt": {
    name: "Order Processing",
    description: "Order fulfillment and dispatch coordination challenges",
    nodeType: "leaf" as const,
    colorScheme: "execution",
    children: ["order-systems", "order-execution"],
  },

  // SHORT-TERM CATEGORY NODES
  "short-forecast": {
    name: "Demand Forecasting",
    description: "Short-term demand prediction accuracy and planning issues",
    nodeType: "leaf" as const,
    colorScheme: "short-term",
    children: ["short-no-price-events", "short-price-events"],
  },
  deployment: {
    name: "Resource Deployment",
    description: "Tactical resource allocation and deployment execution issues",
    nodeType: "leaf" as const,
    colorScheme: "short-term",
    children: ["ineffective-stocking", "effective-stocking"],
  },
  "safety-stock": {
    name: "Inventory Buffer Management",
    description: "Safety stock optimization and buffer inventory management",
    nodeType: "leaf" as const,
    colorScheme: "short-term",
    children: ["sufficient-safety", "insufficient-safety"],
  },

  // INTERMEDIATE CATEGORY NODES
  "long-forecast": {
    name: "Capacity Forecasting",
    description: "Long-term demand forecasting and capacity requirement planning",
    nodeType: "leaf" as const,
    colorScheme: "intermediate",
    children: ["long-no-price-events", "long-price-events"],
  },
  "master-schedule": {
    name: "Production Scheduling",
    description: "Master production schedule execution and capacity utilization",
    nodeType: "leaf" as const,
    colorScheme: "intermediate",
    children: ["insufficient-production", "sufficient-production"],
  },

  // LONG-TERM CATEGORY NODES
  strategic: {
    name: "Strategic Alignment",
    description: "Long-term strategic planning and market alignment initiatives",
    nodeType: "leaf" as const,
    colorScheme: "long-term",
    children: ["insufficient-capacity", "sufficient-capacity"],
  },

  // DISTRIBUTION SUBCATEGORIES
  "carrier-pickup": {
    name: "Carrier Service Failures",
    description: "Late inbound deliveries due to carrier performance issues",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: [],
  },
  "trailers-not-processed": {
    name: "Inbound Processing Delays",
    description: "Inbound trailers not processed within distribution center timeframes",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: [],
  },
  "age-of-stock": {
    name: "Product Age Compliance",
    description: "Products exceeding acceptable age limits per customer requirements",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: [],
  },
  "pick-loading-error": {
    name: "Warehouse Operations",
    description: "Picking, loading, and inventory management process failures",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: [],
  },
  "vehicle-capacity": {
    name: "Loading Capacity Issues",
    description: "Vehicle loading constraints and capacity utilization problems",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: [],
  },
  "throughput-issues": {
    name: "Processing Capacity",
    description: "Distribution center throughput limitations and processing bottlenecks",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: [],
  },
  "external-manufacturer": {
    name: "Third-Party Logistics",
    description: "External manufacturer and third-party logistics service failures",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: [],
  },

  // MANUFACTURING SUBCATEGORIES
  "no-plant-shutdown": {
    name: "Operational Production",
    description: "Production issues during normal plant operations",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: ["no-downed-line", "downed-line"],
  },
  "plant-shutdown": {
    name: "Plant Shutdown Events",
    description: "Unscheduled plant shutdown disruptions",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: ["unscheduled-shutdown"],
  },
  "no-downed-line": {
    name: "Line Availability",
    description: "Production line operational status and material supply issues",
    nodeType: "detail" as const,
    colorScheme: "execution",
    children: [],
  },
  "downed-line": {
    name: "Line Downtime",
    description: "Production line failures and unscheduled downtime events",
    nodeType: "detail" as const,
    colorScheme: "execution",
    children: [],
  },
  "unscheduled-shutdown": {
    name: "Unscheduled Plant Shutdown",
    description: "Unexpected plant closure affecting production capacity",
    nodeType: "detail" as const,
    colorScheme: "execution",
    children: [],
  },

  // ORDER MANAGEMENT SUBCATEGORIES
  "order-systems": {
    name: "Systems Issues",
    description:
      "Issues include but are not limited to IT system issues, PO processing issues, data latency issues; customer/suppliers can be identified",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: [],
  },
  "order-execution": {
    name: "Execution Issues",
    description:
      "Issues include but are not limited to those caused by human error; customer/suppliers can be identified",
    nodeType: "subcategory" as const,
    colorScheme: "execution",
    children: [],
  },

  // SHORT-TERM FORECASTING SUBCATEGORIES
  "short-no-price-events": {
    name: "No Identified Price Events",
    description: "No promotional or pricing activities identified within lead time",
    nodeType: "subcategory" as const,
    colorScheme: "short-term",
    children: ["short-no-promotions", "short-promotions"],
  },
  "short-price-events": {
    name: "Price Events",
    description:
      "Identified price event like price increase or customers' selling price change caused low inventory levels",
    nodeType: "subcategory" as const,
    colorScheme: "short-term",
    children: [],
  },
  "short-no-promotions": {
    name: "No Identified Promotions",
    description: "No promotional activities within lead time",
    nodeType: "detail" as const,
    colorScheme: "short-term",
    children: ["short-lag2-error", "short-no-lag2-error"],
  },
  "short-promotions": {
    name: "Promotions Within Lead Time",
    description: "Identified promotion activity caused low inventory levels",
    nodeType: "detail" as const,
    colorScheme: "short-term",
    children: [],
  },
  "short-lag2-error": {
    name: "Lag 2 Forecast Error",
    description: "Lag 2 forecast error greater than 50%",
    nodeType: "detail" as const,
    colorScheme: "short-term",
    children: [],
  },
  "short-no-lag2-error": {
    name: "No Lag 2 Forecast Error",
    description: "No significant lag 2 forecast error identified",
    nodeType: "detail" as const,
    colorScheme: "short-term",
    children: [],
  },

  // DEPLOYMENT PLANNING SUBCATEGORIES
  "ineffective-stocking": {
    name: "Ineffective Stocking Strategy",
    description: "On-hand inventory less than 60% of safety stock",
    nodeType: "subcategory" as const,
    colorScheme: "short-term",
    children: [],
  },
  "effective-stocking": {
    name: "Effective Stocking Strategy",
    description: "Adequate stocking strategy implementation",
    nodeType: "subcategory" as const,
    colorScheme: "short-term",
    children: [],
  },

  // SAFETY STOCK SUBCATEGORIES
  "sufficient-safety": {
    name: "Sufficient Safety Stock",
    description: "Adequate safety stock levels maintained",
    nodeType: "subcategory" as const,
    colorScheme: "short-term",
    children: [],
  },
  "insufficient-safety": {
    name: "Insufficient Safety Stock",
    description: "No short-term forecast error and no attributable cause of cuts",
    nodeType: "subcategory" as const,
    colorScheme: "short-term",
    children: [],
  },

  // LONG-TERM FORECASTING SUBCATEGORIES
  "long-no-price-events": {
    name: "No Identified Price Events",
    description: "No promotional or pricing activities identified within lead time",
    nodeType: "subcategory" as const,
    colorScheme: "intermediate",
    children: ["long-no-promotions", "long-promotions"],
  },
  "long-price-events": {
    name: "Price Events",
    description:
      "Identified price event like price increase or customers' selling price change caused low inventory levels",
    nodeType: "subcategory" as const,
    colorScheme: "intermediate",
    children: [],
  },
  "long-no-promotions": {
    name: "No Identified Promotions",
    description: "No promotional activities within lead time",
    nodeType: "detail" as const,
    colorScheme: "intermediate",
    children: ["long-lag5-error", "long-no-lag5-error"],
  },
  "long-promotions": {
    name: "Promotions Within Lead Time",
    description: "Identified promotion activity caused low inventory levels",
    nodeType: "detail" as const,
    colorScheme: "intermediate",
    children: [],
  },
  "long-lag5-error": {
    name: "Lag 5 Forecast Error",
    description: "Lag 5 forecast error greater than 50%",
    nodeType: "detail" as const,
    colorScheme: "intermediate",
    children: [],
  },
  "long-no-lag5-error": {
    name: "No Lag 5 Forecast Error",
    description: "No significant lag 5 forecast error identified",
    nodeType: "detail" as const,
    colorScheme: "intermediate",
    children: [],
  },

  // MASTER SCHEDULING SUBCATEGORIES
  "insufficient-production": {
    name: "Insufficient Planned Production",
    description: "No forecast error and no attributable cause of cuts and DFC less than 15 days",
    nodeType: "subcategory" as const,
    colorScheme: "intermediate",
    children: [],
  },
  "sufficient-production": {
    name: "Sufficient Planned Production",
    description: "Adequate production planning and scheduling",
    nodeType: "subcategory" as const,
    colorScheme: "intermediate",
    children: [],
  },

  // STRATEGIC PLANNING SUBCATEGORIES
  "insufficient-capacity": {
    name: "Insufficient Plant Capacity",
    description: "Planning properly executed, but the current manufacturing capacity is not sufficient to meet demand",
    nodeType: "subcategory" as const,
    colorScheme: "long-term",
    children: [],
  },
  "sufficient-capacity": {
    name: "Sufficient Plant Capacity",
    description: "Adequate plant capacity available",
    nodeType: "subcategory" as const,
    colorScheme: "long-term",
    children: ["product-launch-issues", "no-product-launch-issues"],
  },
  "product-launch-issues": {
    name: "Product Launch Issues",
    description: "Complications caused during product launch",
    nodeType: "detail" as const,
    colorScheme: "long-term",
    children: [],
  },
  "no-product-launch-issues": {
    name: "No Complications during Product Launch",
    description: "No complications during product launch",
    nodeType: "detail" as const,
    colorScheme: "long-term",
    children: [],
  },
}

export default function InteractiveTreeFlow() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]))
  // Track the active path through the tree - only nodes in this path can show their children
  const [activePath, setActivePath] = useState<string[]>(["root"])

  // Helper function to get parent ID
  const getParentId = useCallback((nodeId: string): string | undefined => {
    for (const [parentId, parentData] of Object.entries(treeStructure)) {
      if ((parentData.children as string[]).includes(nodeId)) {
        return parentId
      }
    }
    return undefined
  }, [])

  // Helper function to get all descendants of a node
  const getAllDescendants = useCallback((nodeId: string): string[] => {
    const descendants: string[] = []
    const nodeData = treeStructure[nodeId as keyof typeof treeStructure]

    if (nodeData && nodeData.children) {
      nodeData.children.forEach((childId) => {
        descendants.push(childId)
        descendants.push(...getAllDescendants(childId))
      })
    }

    return descendants
  }, [])

  // Helper function to get the path from root to a node
  const getPathToNode = useCallback(
    (nodeId: string): string[] => {
      const path: string[] = []
      let currentId: string | undefined = nodeId

      while (currentId) {
        path.unshift(currentId)
        currentId = getParentId(currentId)
      }

      return path
    },
    [getParentId],
  )

  // Helper function to get siblings of a node
  const getSiblings = useCallback(
    (nodeId: string): string[] => {
      const parentId = getParentId(nodeId)
      if (!parentId) return []

      const parentData = treeStructure[parentId as keyof typeof treeStructure]
      return parentData ? parentData.children.filter((child) => child !== nodeId) : []
    },
    [getParentId],
  )

  // Calculate positions with proper tree structure
  const calculateNodePositions = useCallback(() => {
    const positions = new Map<string, { x: number; y: number; level: number }>()

    // Level X positions
    const levelXPositions = [200, 600, 1000, 1400, 1800] // Fixed positions for each level

    // Root position - level 0
    positions.set("root", { x: levelXPositions[0], y: 400, level: 0 })

    // Only show nodes that are in the active path or are children of nodes in the active path
    const shouldShowNode = (nodeId: string): boolean => {
      // Always show root
      if (nodeId === "root") return true

      // Show if node is in active path
      if (activePath.includes(nodeId)) return true

      // Show if node's parent is in active path and parent is expanded
      const parentId = getParentId(nodeId)
      return parentId !== undefined && activePath.includes(parentId) && expandedNodes.has(parentId)
    }

    // Position nodes level by level
    for (let level = 1; level < 5; level++) {
      const nodesAtLevel: string[] = []

      // Find all nodes that should be shown at this level
      Object.entries(treeStructure).forEach(([nodeId, _nodeData]) => {
        if (shouldShowNode(nodeId)) {
          const parentId = getParentId(nodeId)
          if (parentId && positions.has(parentId)) {
            const parentLevel = positions.get(parentId)!.level
            if (parentLevel === level - 1) {
              nodesAtLevel.push(nodeId)
            }
          }
        }
      })

      // Group nodes by their parent for symmetric positioning
      const nodesByParent = new Map<string, string[]>()
      nodesAtLevel.forEach((nodeId) => {
        const parentId = getParentId(nodeId)!
        if (!nodesByParent.has(parentId)) {
          nodesByParent.set(parentId, [])
        }
        nodesByParent.get(parentId)!.push(nodeId)
      })

      // Position each group symmetrically around their parent
      nodesByParent.forEach((children, parentId) => {
        const parentPos = positions.get(parentId)
        if (!parentPos) return

        const childCount = children.length
        const parentY = parentPos.y
        const startY = parentY - (childCount - 1) * 75 // Center children around parent

        children.forEach((childId, index) => {
          positions.set(childId, {
            x: levelXPositions[level],
            y: startY + index * 150,
            level: level,
          })
        })
      })
    }

    return positions
  }, [expandedNodes, activePath, getParentId])

  // Generate nodes based on expanded state and active path
  const initialNodes = useMemo(() => {
    const nodes: Node<TreeNodeData>[] = []
    const positions = calculateNodePositions()

    positions.forEach((position, nodeId) => {
      const nodeData = treeStructure[nodeId as keyof typeof treeStructure]
      if (!nodeData) return

      const isExpanded = expandedNodes.has(nodeId)
      const hasChildren = nodeData.children.length > 0

      nodes.push({
        id: nodeId,
        type: "customNode",
        position: { x: position.x, y: position.y },
        data: {
          name: nodeData.name,
          description: nodeData.description,
          level: position.level,
          hasChildren,
          isExpanded,
          parentId: getParentId(nodeId),
          nodeType: nodeData.nodeType,
          colorScheme: nodeData.colorScheme,
        },
        draggable: true,
      })
    })

    return nodes
  }, [expandedNodes, activePath, calculateNodePositions, getParentId])

  // Generate edges
  const initialEdges = useMemo(() => {
    const edges: Edge[] = []

    initialNodes.forEach((node) => {
      if (node.data.parentId && expandedNodes.has(node.data.parentId)) {
        edges.push({
          id: `${node.data.parentId}-${node.id}`,
          source: node.data.parentId,
          target: node.id,
        
          style: {
            stroke: "#9ca3af",
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#9ca3af",
          },
          animated: true,
        })
      }
    })

    return edges
  }, [initialNodes, expandedNodes])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  React.useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<TreeNodeData>) => {
      if (node.data.hasChildren) {
        const newExpanded = new Set(expandedNodes)

        if (node.id === "root") {
          // Toggle root expansion
          if (newExpanded.has("root")) {
            newExpanded.clear()
            setActivePath(["root"])
          } else {
            newExpanded.add("root")
            setActivePath(["root"])
          }
        } else {
          // For any other node, update the active path and handle expansion
          const nodePathToRoot = getPathToNode(node.id)

          if (newExpanded.has(node.id)) {
            // If node is expanded, collapse it and remove its descendants
            newExpanded.delete(node.id)
            getAllDescendants(node.id).forEach((desc) => newExpanded.delete(desc))

            // Update active path to parent
            const parentPath = nodePathToRoot.slice(0, -1)
            setActivePath(parentPath)
          } else {
            // Expand the node
            newExpanded.add(node.id)

            // Hide siblings' descendants when expanding this node
            const siblings = getSiblings(node.id)
            siblings.forEach((siblingId) => {
              getAllDescendants(siblingId).forEach((desc) => newExpanded.delete(desc))
            })

            // Update active path to include this node
            setActivePath(nodePathToRoot)
          }
        }

        setExpandedNodes(newExpanded)
      }
    },
    [expandedNodes, getPathToNode, getAllDescendants, getSiblings],
  )

  const resetView = useCallback(() => {
    setExpandedNodes(new Set(["root"]))
    setActivePath(["root"])
  }, [])

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="absolute top-4 right-4 z-10 flex gap-4">
        <Button onClick={resetView} variant="outline" className="bg-white shadow-md">
          Reset View
        </Button>
        <div className="bg-white px-3 py-1 rounded shadow-md text-sm text-gray-600">
          Active Path: {activePath.join(" → ")}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Controls />
        <Background color="#f8fafc" gap={20} />
      </ReactFlow>
    </div>
  )
}
