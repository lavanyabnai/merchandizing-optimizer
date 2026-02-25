import { Grid } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FinancialMetrics() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Grid className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-blue-600">44,718,372</span>
            <span className="text-gray-500">USD</span>
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-200">
              N/A
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Grid className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Total Cost</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-blue-600">18,179,911.473</span>
            <span className="text-gray-500">USD</span>
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-200">
              N/A
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Grid className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Profit</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-blue-600">26,538,460.527</span>
            <span className="text-gray-500">USD</span>
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-200">
              N/A
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Grid className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Average Cost per Item</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-blue-600">5,073.13</span>
            <span className="text-gray-500">USD</span>
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-200">
              N/A
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
