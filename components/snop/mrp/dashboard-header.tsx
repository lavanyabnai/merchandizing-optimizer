import { CalendarIcon, TrendingUpIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardHeaderProps {
  totalCost: number
  endItemCost: number
  componentCost: number
}

export function DashboardHeader({ totalCost, endItemCost, componentCost }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Material Requirements Planning</h1>
          <p className="text-gray-500 mt-1">Multi-Level Supply Chain Optimization</p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total System Cost</p>
                <h3 className="text-2xl font-bold text-blue-900">${totalCost.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">End Item Cost</p>
                <h3 className="text-2xl font-bold text-green-900">${endItemCost.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Component Cost</p>
                <h3 className="text-2xl font-bold text-purple-900">${componentCost.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUpIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
