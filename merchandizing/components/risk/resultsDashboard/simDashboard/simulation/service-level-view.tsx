"use client"

import ChartCard from "./chart-card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

export default function ServiceLevelView() {
  // Generate data for service level charts
  const generateServiceLevelData = (startDay = 0, initialValue = 0.995) => {
    return Array.from({ length: 35 }).map((_, i) => {
      const day = startDay + i * 10
      let value = initialValue

      // Create a step function at day 150
      if (day > 150) {
        value = initialValue - 0.02 + Math.random() * 0.005
      }

      return { day, value }
    })
  }

  // Service Level by Products (Per Product)
  const productServiceLevelData = generateServiceLevelData(0, 0.999)

  // Service Level by Products (Per Source)
  const sourceServiceLevelData = [
    ...generateServiceLevelData(0, 0.999).map((item) => ({ ...item, source: "Source 1" })),
    ...generateServiceLevelData(0, 0.998).map((item) => ({ ...item, source: "Source 2" })),
  ]

  // Service Level by Revenue (Per Object)
  const revenueServiceLevelData = generateServiceLevelData(0, 0.997)

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <ChartCard title="Service Level by Products (Per Product)" visibleItems="1 of 1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={productServiceLevelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0.995, 1]} tickCount={6} />
            <Tooltip formatter={(value: number) => value.toFixed(4)} />
            <ReferenceLine x={150} stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Service Level by Products (Per Source)" visibleItems="2 of 2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sourceServiceLevelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0.995, 1]} tickCount={6} />
            <Tooltip formatter={(value: number) => value.toFixed(4)} />
            <ReferenceLine x={150} stroke="#22c55e" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              name="Source 1"
            />
            <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} name="Source 2" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Service Level by Revenue (Per Object)" visibleItems="20 of 50">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueServiceLevelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0.95, 1]} tickCount={6} />
            <Tooltip formatter={(value: number) => value.toFixed(4)} />
            <ReferenceLine x={150} stroke="#000" strokeWidth={1} />
            <ReferenceLine y={1} stroke="#000" strokeWidth={1} />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Second row of charts */}
      <ChartCard title="ELT Service Level by Products (Per Product)" visibleItems="1 of 1">
        <div className="h-full w-full flex items-center justify-center text-gray-400">
          <span>No data available</span>
        </div>
      </ChartCard>

      <ChartCard title="ELT Service Level by Products (Per Source)" visibleItems="1 of 1">
        <div className="h-full w-full flex items-center justify-center text-gray-400">
          <span>No data available</span>
        </div>
      </ChartCard>

      <ChartCard title="ELT Service Level by Revenue (Per Object)" visibleItems="1 of 1">
        <div className="h-full w-full flex items-center justify-center text-gray-400">
          <span>No data available</span>
        </div>
      </ChartCard>
    </div>
  )
}
