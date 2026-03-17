import type React from "react"
import { Settings, Maximize2, List, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ChartCardProps {
  title: string
  children: React.ReactNode
  visibleItems?: string
  hasTable?: boolean
}

export default function ChartCard({ title, children, visibleItems, hasTable = false }: ChartCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 flex-row items-center justify-between border-b">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-1">
          {hasTable && (
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <FileText size={16} />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Maximize2 size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-64">{children}</CardContent>
      {visibleItems && (
        <div className="p-2 border-t flex items-center justify-between text-xs text-gray-500">
          <div>Chart items visible: {visibleItems}</div>
          <List size={16} />
        </div>
      )}
    </Card>
  )
}
