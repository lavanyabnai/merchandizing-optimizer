import { ShoppingBagIcon, TruckIcon, PercentIcon, HomeIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { NetworkModel } from "./types"

interface DashboardHeaderProps {
  model: NetworkModel
  scenarioName: string
}

export function DashboardHeader({ model, scenarioName }: DashboardHeaderProps) {
  // Calculate channel distribution percentages
  const totalDemand = model.totalDemand
  const convStorePercent = (model.channelFlows[0].delivered / totalDemand) * 100
  const retailStorePercent = (model.channelFlows[1].delivered / totalDemand) * 100
  const apsPercent = (model.channelFlows[2].delivered / totalDemand) * 100
  const homePercent = (model.channelFlows[3].delivered / totalDemand) * 100

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-purple-800">Omni-Channel Network Optimization</h1>
          <p className="text-gray-500 mt-1">
            Scenario: <span className="font-medium">{scenarioName}</span> | Total Cost:{" "}
            <span className="font-medium">${model.costBreakdown.totalCost.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 text-sm text-gray-500">
          <TruckIcon className="h-4 w-4 mr-1" />
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Retail Store Delivery</p>
                <h3 className="text-2xl font-bold text-purple-900">{retailStorePercent.toFixed(1)}%</h3>
                <p className="text-xs text-purple-700 mt-1">{model.channelFlows[1].delivered.toLocaleString()} boxes</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Convenience Store Pickup</p>
                <h3 className="text-2xl font-bold text-blue-900">{convStorePercent.toFixed(1)}%</h3>
                <p className="text-xs text-blue-700 mt-1">{model.channelFlows[0].delivered.toLocaleString()} boxes</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">APS Pickup</p>
                <h3 className="text-2xl font-bold text-amber-900">{apsPercent.toFixed(1)}%</h3>
                <p className="text-xs text-amber-700 mt-1">{model.channelFlows[2].delivered.toLocaleString()} boxes</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <PercentIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Home Delivery</p>
                <h3 className="text-2xl font-bold text-green-900">{homePercent.toFixed(1)}%</h3>
                <p className="text-xs text-green-700 mt-1">{model.channelFlows[3].delivered.toLocaleString()} boxes</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <HomeIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
