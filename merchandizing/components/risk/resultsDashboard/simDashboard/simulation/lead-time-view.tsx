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
  Bar,
  ComposedChart,
} from "recharts"

export default function LeadTimeView() {
  // Generate data for lead time charts
  const generateLeadTimeData = () => {
    return Array.from({ length: 35 }).map((_, i) => {
      const day = i * 10
      return {
        day,
        line1: 0.65,
        line2: 0.5,
        line3: 0.4,
        line4: 0.45,
        line5: 0.3,
        line6: 0.2,
        line7: 0.15,
      }
    })
  }

  const leadTimeData = generateLeadTimeData()

  // Mean Lead Time data
  const meanLeadTimeData = Array.from({ length: 35 }).map((_, i) => {
    const day = i * 10
    return {
      day,
      best: 0.18,
      worst: 0.65,
    }
  })

  // Max Lead Time data (histogram)
  const maxLeadTimeData = [
    { value: 0.05, count: 18 },
    { value: 0.15, count: 8 },
    { value: 0.25, count: 7 },
    { value: 0.35, count: 4 },
    { value: 0.45, count: 3 },
    { value: 0.55, count: 2 },
    { value: 0.65, count: 1 },
  ]

  // Distribution curve data
  const distributionCurveData = Array.from({ length: 70 }).map((_, i) => {
    const x = i * 0.01
    // Bell curve formula
    const y = 2 + 16 * Math.exp(-Math.pow(x - 0.1, 2) / 0.02)
    return { x, y }
  })

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="Lead Time" visibleItems="20 of 50">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={leadTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0.1, 0.7]} />
            <Tooltip />
            <Line type="monotone" dataKey="line1" stroke="#ef4444" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="line2" stroke="#3b82f6" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="line3" stroke="#8b5cf6" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="line4" stroke="#ec4899" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="line5" stroke="#f59e0b" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="line6" stroke="#10b981" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="line7" stroke="#6366f1" strokeWidth={1} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Mean Lead Time (Best-Mean-Worst)" visibleItems="2 of 2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={meanLeadTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0.1, 0.7]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="worst"
              stroke="#8b5cf6"
              strokeWidth={1}
              dot={false}
              strokeDasharray="5 5"
              name="Worst"
            />
            <Line
              type="monotone"
              dataKey="best"
              stroke="#10b981"
              strokeWidth={1}
              dot={false}
              strokeDasharray="5 5"
              name="Best"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Max Lead Time" visibleItems="3 of 3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={maxLeadTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="value" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="count" fill="#3b82f6" />
            <Line
              yAxisId="right"
              type="monotone"
              data={distributionCurveData}
              dataKey="y"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
