"use client"
import { ReactFlow, useNodesState, useEdgesState, addEdge, MarkerType } from "@xyflow/react"
import { useCallback } from "react"
import { FaWarehouse, FaShoppingCart } from "react-icons/fa"
import { GiCargoShip } from "react-icons/gi"
import { MdFactory } from "react-icons/md"

import "@xyflow/react/dist/base.css"
import CustomNode from "@/app/data/riskData/flow/CustomNodeTail"

const nodeTypes = {
  custom: CustomNode,
}

const initNodes = [
  {
    id: "1",
    type: "custom",
    data: {
      name: "Import from China",
      bgColor: "bg-blue-500",
      textColor: "text-white",
      icon: MdFactory,
    },
    position: { x: -120, y: 10 },
    sourcePosition: "right",
  },
  {
    id: "2",
    type: "custom",
    data: {
      name: "Supplier 1",
      bgColor: "bg-orange-500",
      textColor: "text-white",
      icon: MdFactory,
    },
    position: { x: -120, y: 260 },
    targetPosition: "left",
    sourcePosition: "right",
  },
  {
    id: "3",
    type: "custom",
    data: {
      name: "Supplier 2",
      bgColor: "bg-orange-500",
      textColor: "text-white",
      icon: MdFactory,
    },
    position: { x: -120, y: 540 },
  },
  {
    id: "4",
    type: "custom",
    data: {
      name: "Port Long Beach",
      bgColor: "bg-violet-700",
      textColor: "text-white",
      icon: GiCargoShip,
    },
    position: { x: 350, y: -450 },
  },
  {
    id: "5",
    type: "custom",
    data: {
      name: "DC Atlanta",
      bgColor: "bg-sky-500",
      textColor: "text-white",
      icon: FaWarehouse,
    },
    position: { x: 350, y: -210 },
  },
  {
    id: "6",
    type: "custom",
    data: {
      name: "DC Dallas",
      bgColor: "bg-sky-500",
      textColor: "text-white",
      icon: FaWarehouse,
    },
    position: { x: 350, y: 30 },
  },
  {
    id: "7",
    type: "custom",
    data: {
      name: "DC New York",
      bgColor: "bg-sky-500",
      textColor: "text-white",
      icon: FaWarehouse,
    },
    position: { x: 350, y: 270 },
  },
  {
    id: "8",
    type: "custom",
    data: {
      name: "DC Seattle",
      bgColor: "bg-sky-500",
      textColor: "text-white",
      icon: FaWarehouse,
    },
    position: { x: 350, y: 510 },
  },
  {
    id: "9",
    type: "custom",
    data: {
      name: "DC Los Angeles",
      bgColor: "bg-sky-500",
      textColor: "text-white",
      icon: FaWarehouse,
    },
    position: { x: 350, y: 750 },
  },
  {
    id: "10",
    type: "custom",
    data: {
      name: "DC Houston",
      bgColor: "bg-sky-500",
      textColor: "text-white",
      icon: FaWarehouse,
    },
    position: { x: 800, y: -670 },
  },
  {
    id: "11",
    type: "custom",
    data: {
      name: "DC Miami",
      bgColor: "bg-sky-500",
      textColor: "text-white",
      icon: FaWarehouse,
    },
    position: { x: 800, y: -430 },
  },
  {
    id: "12",
    type: "custom",
    data: {
      name: "Store Atlanta",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 800, y: -190 },
  },
  {
    id: "13",
    type: "custom",
    data: {
      name: "Store Dallas",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 800, y: 50 },
  },
  {
    id: "14",
    type: "custom",
    data: {
      name: "Store New York",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 800, y: 290 },
  },
  {
    id: "15",
    type: "custom",
    data: {
      name: "Store Seattle",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 800, y: 530 },
  },
  {
    id: "16",
    type: "custom",
    data: {
      name: "Store Los Angeles",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 800, y: 770 },
  },
  {
    id: "17",
    type: "custom",
    data: {
      name: "Store Houston",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 800, y: 1010 },
  },
  {
    id: "18",
    type: "custom",
    data: {
      name: "Store Miami",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 800, y: 1250 },
  },
  {
    id: "19",
    type: "custom",
    data: {
      name: "Store New York",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 800, y: 1490 },
  },
  {
    id: "20",
    type: "custom",
    data: {
      name: "Store Seattle",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 800, y: 1730 },
  },
  {
    id: "21",
    type: "custom",
    data: {
      name: "Store Los Angeles",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 1200, y: -670 },
  },
  {
    id: "22",
    type: "custom",
    data: {
      name: "Store Houston",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 1200, y: -430 },
  },
  {
    id: "23",
    type: "custom",
    data: {
      name: "Store Miami",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 1200, y: -190 },
  },
  {
    id: "24",
    type: "custom",
    data: {
      name: "Store Atlanta",
      bgColor: "bg-green-500",
      textColor: "text-white",
      icon: FaShoppingCart,
    },
    position: { x: 1200, y: 50 },
  },
]

const initEdges = [
  {
    id: "e1-1",
    source: "1",
    target: "4",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    type: "straight",
  },
  {
    id: "e1-2",
    source: "1",
    target: "5",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: "e1-3",
    source: "1",
    target: "6",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: "e1-4",
    source: "2",
    target: "5",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: "e1-5",
    source: "2",
    target: "6",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: "e1-6",
    source: "2",
    target: "7",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: "e1-7",
    source: "3",
    target: "7",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: "e1-8",
    source: "3",
    target: "8",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: "e1-9",
    source: "3",
    target: "9",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: "e1-10",
    source: "4",
    target: "10",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: "e1-11",
    source: "4",
    target: "11",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-12",
    source: "5",
    target: "10",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-13",
    source: "6",
    target: "11",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-14",
    source: "6",
    target: "13",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-15",
    source: "6",
    target: "14",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-16",
    source: "7",
    target: "14",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-17",
    source: "7",
    target: "15",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-18",
    source: "8",
    target: "15",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-19",
    source: "8",
    target: "16",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-20",
    source: "8",
    target: "17",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-21",
    source: "9",
    target: "18",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-22",
    source: "9",
    target: "19",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-23",
    source: "9",
    target: "20",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-24",
    source: "10",
    target: "21",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-25",
    source: "10",
    target: "22",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-26",
    source: "11",
    target: "23",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-27",
    source: "11",
    target: "24",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
]

export default function Flowchart() {
  const [nodes, onNodesChange] = useNodesState(initNodes as any)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  const onConnect = useCallback((params: any) => setEdges((eds: any) => addEdge(params, eds)), [])

  return (
    <>
      <div className="m-4">
        <div className="flex items-center justify-center rounded-t-lg bg-gradient-to-t from-indigo-400 via-cyan-400 to-sky-500 shadow-lg p-0.5">
          <div className="flex items-center w-full justify-between bg-sky-50 border rounded-t-lg text-2xl text-blue-900 font-bold">
            <div className="p-2">Network View</div>
          </div>
        </div>

        <div className="border rounded-lg">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange as any}
            onEdgesChange={onEdgesChange as any}
            onConnect={onConnect as any}
            nodeTypes={nodeTypes}
            fitView
            className="bg-zinc-50 w-full h-[800px] flex justify-start items-center overflow-y-auto"
          ></ReactFlow>
        </div>
      </div>
    </>
  )
}
