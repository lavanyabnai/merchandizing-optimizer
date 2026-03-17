"use client"

import { useMemo } from "react"
import type { ProductFlow } from "@/components/productFlow/product-flow-data"
import ReactFlow, {
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"

interface ProductFlowChartProps {
  flows: ProductFlow[]
}

function ReactFlowDiagram({ flows }: { flows: ProductFlow[] }) {
  
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodeMap = new Map()
    const edges: Edge[] = []

    // Create nodes from flows
    flows.forEach((flow, index) => {
      // Add source node
      if (!nodeMap.has(flow.from)) {
        nodeMap.set(flow.from, {
          id: flow.from,
          type: "default",
          position: { x: 100, y: nodeMap.size * 80 + 50 },
          data: {
            label: flow.from,
            type: "source",
            totalFlow: 0,
            totalCost: 0,
          },
          style: {
            background: "#059669",
            color: "white",
            border: "2px solid white",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
          },
        })
      }

      // Add destination node
      if (!nodeMap.has(flow.to)) {
        nodeMap.set(flow.to, {
          id: flow.to,
          type: "default",
          position: { x: 600, y: nodeMap.size * 60 + 50 },
          data: {
            label: flow.to,
            type: "destination",
            totalFlow: 0,
            totalCost: 0,
          },
          style: {
            background: "#dc2626",
            color: "white",
            border: "2px solid white",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
          },
        })
      }

      // Update totals
      nodeMap.get(flow.from).data.totalFlow += flow.flow
      nodeMap.get(flow.from).data.totalCost += flow.cost
      nodeMap.get(flow.to).data.totalFlow += flow.flow
      nodeMap.get(flow.to).data.totalCost += flow.cost

      // Create edge
      const maxFlow = Math.max(...flows.map((f) => f.flow))
      const strokeWidth = Math.max(2, Math.min(8, (flow.flow / maxFlow) * 8))

      const productColors: { [key: string]: string } = {
        Vitamins: "#059669",
        Supplements: "#dc2626",
        Pharmaceuticals: "#2563eb",
        "Medical Devices": "#7c3aed",
        Vaccines: "#ea580c",
      }

      edges.push({
        id: `${flow.from}-${flow.to}-${index}`,
        source: flow.from,
        target: flow.to,
        type: "smoothstep",
        animated: flow.periods === "Peak period",
        style: {
          stroke: productColors[flow.product] || "#6b7280",
          strokeWidth: strokeWidth,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: productColors[flow.product] || "#6b7280",
        },
        label: `${flow.product}: ${flow.flow}`,
        labelStyle: {
          fontSize: "10px",
          fontWeight: "bold",
        },
        data: flow,
      })
    })

    return {
      nodes: Array.from(nodeMap.values()),
      edges,
    }
  }, [flows])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      attributionPosition="bottom-left"
    >
      <Background />
      <Controls />
    </ReactFlow>
  )
}

export default function ProductFlowChart({ flows }: ProductFlowChartProps) {
  const chartData = useMemo(() => {
    // Create nodes and links for the flow chart
    const nodes = new Map()
    const links: any[] = []

    flows.forEach((flow) => {
      // Add source node
      if (!nodes.has(flow.from)) {
        nodes.set(flow.from, {
          id: flow.from,
          name: flow.from,
          type: "source",
          totalFlow: 0,
          totalCost: 0,
        })
      }

      // Add destination node
      if (!nodes.has(flow.to)) {
        nodes.set(flow.to, {
          id: flow.to,
          name: flow.to,
          type: "destination",
          totalFlow: 0,
          totalCost: 0,
        })
      }

      // Update node totals
      nodes.get(flow.from).totalFlow += flow.flow
      nodes.get(flow.from).totalCost += flow.cost
      nodes.get(flow.to).totalFlow += flow.flow
      nodes.get(flow.to).totalCost += flow.cost

      // Add link
      links.push({
        source: flow.from,
        target: flow.to,
        product: flow.product,
        flow: flow.flow,
        cost: flow.cost,
        distance: flow.distance,
        periods: flow.periods,
      })
    })

    return {
      nodes: Array.from(nodes.values()),
      links,
    }
  }, [flows])

  const productSummary = useMemo(() => {
    const products = new Map()

    flows.forEach((flow) => {
      if (!products.has(flow.product)) {
        products.set(flow.product, {
          product: flow.product,
          totalFlow: 0,
          totalCost: 0,
          routes: 0,
          avgDistance: 0,
        })
      }

      const p = products.get(flow.product)
      p.totalFlow += flow.flow
      p.totalCost += flow.cost
      p.routes += 1
      p.avgDistance += flow.distance
    })

    // Calculate averages
    products.forEach((p) => {
      p.avgDistance = p.avgDistance / p.routes
    })

    return Array.from(products.values()).sort((a, b) => b.totalFlow - a.totalFlow)
  }, [flows])

  return (
    <div className="w-full h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Cold Chain Product Flow Analysis</h2>
        <p className="text-sm text-gray-600">Distribution network visualization and metrics</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {flows.reduce((sum, f) => sum + f.flow, 0).toLocaleString()}
            </div>
            <div className="text-sm text-blue-800">Total Units</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              £{flows.reduce((sum, f) => sum + f.cost, 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-800">Total Cost</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{chartData.nodes.length}</div>
            <div className="text-sm text-purple-800">Locations</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{flows.length}</div>
            <div className="text-sm text-orange-800">Routes</div>
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Flow Summary</h3>
          <div className="space-y-3">
            {productSummary.map((product, index) => (
              <div key={product.product} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      index === 0
                        ? "bg-emerald-500"
                        : index === 1
                          ? "bg-blue-500"
                          : index === 2
                            ? "bg-purple-500"
                            : index === 3
                              ? "bg-orange-500"
                              : "bg-gray-500"
                    }`}
                  ></div>
                  <div>
                    <div className="font-medium text-gray-900">{product.product}</div>
                    <div className="text-sm text-gray-500">{product.routes} routes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{product.totalFlow.toLocaleString()} units</div>
                  <div className="text-sm text-gray-500">£{product.totalCost.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Network Diagram */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Network Flow Diagram</h3>
          <div className="bg-white rounded border" style={{ height: "500px" }}>
            <ReactFlowDiagram flows={flows} />
          </div>
        </div>
      </div>
    </div>
  )
}
