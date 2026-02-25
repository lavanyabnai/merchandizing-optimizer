import { TruckIcon, BarChart3Icon, PackageIcon, PercentIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { WarehouseKpis } from "./types"

interface DashboardHeaderProps {
  kpis: WarehouseKpis
}

export function DashboardHeader({ kpis }: DashboardHeaderProps) {
  // Calculate network-wide KPIs
  const warehouseCount = Object.keys(kpis).length
  const avgServiceLevel = Object.values(kpis).reduce((sum, kpi) => sum + kpi.serviceLevel, 0) / warehouseCount
  const avgInventoryTurnover = Object.values(kpis).reduce((sum, kpi) => sum + kpi.inventoryTurnover, 0) / warehouseCount
  const totalAvgInventory = Object.values(kpis).reduce((sum, kpi) => sum + kpi.averageInventory, 0)
  const totalStockoutPeriods = Object.values(kpis).reduce((sum, kpi) => sum + kpi.stockoutPeriods, 0)

  // Format date consistently
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(new Date())

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Distribution Requirements Planning</h1>
          <p className="text-gray-500 mt-1">Multi-Echelon Inventory Optimization</p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 text-sm text-gray-500">
          <TruckIcon className="h-4 w-4 mr-1" />
          Last updated: {formattedDate}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Network Service Level</p>
                <h3 className="text-2xl font-bold text-blue-900">{avgServiceLevel.toFixed(1)}%</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <PercentIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg Inventory Turnover</p>
                <h3 className="text-2xl font-bold text-green-900">{avgInventoryTurnover.toFixed(1)}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <BarChart3Icon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Average Inventory</p>
                <h3 className="text-2xl font-bold text-purple-900">{totalAvgInventory.toFixed(0)} units</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <PackageIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Stockout Periods</p>
                <h3 className="text-2xl font-bold text-amber-900">{totalStockoutPeriods}</h3>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <TruckIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
