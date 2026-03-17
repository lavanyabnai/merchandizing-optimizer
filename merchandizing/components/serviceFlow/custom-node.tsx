import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface CustomNodeData {
  name: string
  hasChildren: boolean
  isExpanded: boolean
  description?: string
  colorScheme?: string
}

interface CustomNodeProps {
  data: CustomNodeData
}

function CustomNode({ data }: CustomNodeProps) {
  // Define color schemes
  const getColorClasses = (colorScheme?: string) => {
    switch (colorScheme) {
      case "execution":
        return "bg-red-100 text-red-800 border-red-200"
      case "short-term":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "intermediate":
        return "bg-green-100 text-green-800 border-green-200"
      case "long-term":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="shadow-lg rounded-lg bg-white border border-gray-200">
      <div className="w-72">
        <div className="p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-center font-semibold text-gray-800">
            {data.hasChildren && (
              <div className="flex-shrink-0">
                {data.isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-gray-600" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-600" />
                )}
              </div>
            )}
            <span className={`px-3 py-1 rounded-md font-medium ${getColorClasses(data.colorScheme)}`}>{data.name}</span>
          </div>
          {data.description && (
            <div className="mt-3 text-xs text-gray-600 text-center leading-relaxed">{data.description}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-1 bg-green-500" />
      <Handle type="target" position={Position.Left} className="w-1 bg-green-500" />
    </div>
  )
}

export default memo(CustomNode)
