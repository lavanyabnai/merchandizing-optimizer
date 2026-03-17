"use client"

import ChartCard from "./chart-card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts"

export default function InventoryView() {
  // Generate inventory data with step patterns
  const generateInventoryData = (includeNegative = false) => {
    return Array.from({ length: 35 }).map((_, i) => {
      const day = i * 10
      let baseValue = 10

      // Create step pattern
      if (day < 150) {
        baseValue = 10
      } else if (day < 200) {
        baseValue = 8
      } else {
        baseValue = 10
      }

      // Add oscillation
      const oscillation = Math.sin(i * 0.5) * 0.5 + 0.5
      const value = baseValue + oscillation

      // For backlog chart
      const negativeValue = includeNegative ? -(baseValue / 2 + oscillation / 2) : 0

      return {
        day,
        value,
        negativeValue,
        // Add a spike at the beginning for the pink line
        spike: i === 1 ? 2 : 0,
      }
    })
  }

  const inventoryData = generateInventoryData()
  const backlogData = generateInventoryData(true)

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="Available Inventory" visibleItems="4 of 4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={inventoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 18]} />
            <Tooltip />
            <Line type="stepAfter" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="spike" stroke="#ec4899" strokeWidth={2} dot={false} />
            {/* Blue vertical lines */}
            {Array.from({ length: 35 }).map((_, i) => (
              <ReferenceLine key={i} x={i * 10} stroke="#3b82f6" strokeWidth={1} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="On-hand Inventory" visibleItems="4 of 4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={inventoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 18]} />
            <Tooltip />
            <Line type="stepAfter" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="spike" stroke="#ec4899" strokeWidth={2} dot={false} />
            {/* Blue vertical lines */}
            {Array.from({ length: 35 }).map((_, i) => (
              <ReferenceLine key={i} x={i * 10} stroke="#3b82f6" strokeWidth={1} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Average Daily Available Inventory" visibleItems="4 of 4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={inventoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 18]} />
            <Tooltip />
            <Line type="stepAfter" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="spike" stroke="#ec4899" strokeWidth={2} dot={false} />
            {/* Blue vertical lines */}
            {Array.from({ length: 35 }).map((_, i) => (
              <ReferenceLine key={i} x={i * 10} stroke="#3b82f6" strokeWidth={1} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Second row */}
      <ChartCard title="Available Inventory Including Backlog" visibleItems="4 of 4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={backlogData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[-20, 15]} />
            <Tooltip />
            <Area type="stepAfter" dataKey="value" fill="#22c55e" stroke="#22c55e" fillOpacity={0.3} strokeWidth={2} />
            <Area
              type="stepAfter"
              dataKey="negativeValue"
              fill="#8b5cf6"
              stroke="#8b5cf6"
              fillOpacity={0.3}
              strokeWidth={2}
              baseValue={0}
            />
            <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Average Daily On-hand Inventory" visibleItems="4 of 4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={inventoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 18]} />
            <Tooltip />
            <Line type="stepAfter" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="spike" stroke="#ec4899" strokeWidth={2} dot={false} />
            {/* Blue vertical lines */}
            {Array.from({ length: 35 }).map((_, i) => (
              <ReferenceLine key={i} x={i * 10} stroke="#3b82f6" strokeWidth={1} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
