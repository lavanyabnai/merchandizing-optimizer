import { CalendarIcon } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b">
      <div>
        <h1 className="text-3xl font-bold text-blue-800">Production Planning Optimization</h1>
        <p className="text-gray-500 mt-1">Mixed Integer Linear Programming Model</p>
      </div>
      <div className="flex items-center mt-4 md:mt-0 text-sm text-gray-500">
        <CalendarIcon className="h-4 w-4 mr-1" />
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  )
}
