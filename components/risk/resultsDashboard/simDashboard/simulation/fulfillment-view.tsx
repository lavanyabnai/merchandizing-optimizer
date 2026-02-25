"use client"

import ChartCard from "./chart-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function FulfillmentView() {
  // Demand Placed, Fulfillment Received (Accumulated) data
  const demandFulfillmentData = [
    { id: 1, statistic: "Demand Placed (Accumulated)", product: "Shoes", value: "" },
    { id: 2, statistic: "Demand Placed (Percentage)", product: "Shoes", value: "" },
    { id: 3, statistic: "Fulfillment Received (Accumulated)", product: "Shoes", value: "" },
    { id: 4, statistic: "Fulfillment Received (Percentage)", product: "Shoes", value: "" },
  ]

  // Demand Received, Fulfillment Shipped data
  const demandReceivedData = [
    { id: 1, statistic: "Demand Received (Daily)", object: "DC Itami", product: "Shoes" },
    { id: 2, statistic: "Demand Received (Daily)", object: "DC Tokyo", product: "Shoes" },
    { id: 3, statistic: "Demand Received (Daily)", object: "Factory Qui Nhon", product: "Shoes" },
    { id: 4, statistic: "Demand Received (Daily)", object: "Port Kobe", product: "Shoes" },
    { id: 5, statistic: "Demand Received (Daily)", object: "Port Vung Tau", product: "Shoes" },
  ]

  // Demand Placed, Fulfillment Received (Accumulated, Per Object) data
  const demandPerObjectData = [
    { id: 1, statistic: "Demand Placed (Accumulated)", object: "Fujisawa", product: "Shoes" },
    { id: 2, statistic: "Demand Placed (Accumulated)", object: "Iwaki", product: "Shoes" },
    { id: 3, statistic: "Demand Placed (Accumulated)", object: "Kawaguchi", product: "Shoes" },
  ]

  // Generate data for daily demand chart
  const generateDailyDemandData = () => {
    return Array.from({ length: 35 }).map((_, i) => {
      const day = i * 10
      let value = 18

      // Create step pattern
      if (day > 250) {
        value = 14
      }

      return { day, value }
    })
  }

  const dailyDemandData = generateDailyDemandData()

  // Generate data for percentage chart
  const generatePercentageData = () => {
    return Array.from({ length: 35 }).map((_, i) => {
      const day = i * 10
      let value = 0.65

      // Create step pattern
      if (day > 250) {
        value = 0.45
      }

      return { day, value }
    })
  }

  const percentageData = generatePercentageData()

  // Generate data for shipped chart with spike
  const generateShippedData = () => {
    return Array.from({ length: 35 }).map((_, i) => {
      const day = i * 10
      let value = 18

      // Create step pattern with spike
      if (i === 15) {
        value = 35 // Spike
      } else if (day < 150) {
        value = 18
      } else if (day < 250) {
        value = 20
      } else {
        value = 14
      }

      return { day, value }
    })
  }

  const shippedData = generateShippedData()

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="Demand Placed, Fulfillment Received (Accumulated)" hasTable={true}>
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Statistics</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demandFulfillmentData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.statistic}</TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>

      <ChartCard title="Demand Placed, Fulfillment Received (Daily)" visibleItems="2 of 2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyDemandData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 20]} />
            <Tooltip />
            <Bar dataKey="value" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Demand Received, Fulfillment Shipped (Daily)" hasTable={true}>
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Statistics</TableHead>
                <TableHead>Object</TableHead>
                <TableHead>Product</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demandReceivedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.statistic}</TableCell>
                  <TableCell>{row.object}</TableCell>
                  <TableCell>{row.product}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>

      {/* Second row */}
      <ChartCard title="Demand Placed, Fulfillment Received (Accumulated, Per Object)" hasTable={true}>
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Statistics</TableHead>
                <TableHead>Object</TableHead>
                <TableHead>Product</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demandPerObjectData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.statistic}</TableCell>
                  <TableCell>{row.object}</TableCell>
                  <TableCell>{row.product}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>

      <ChartCard title="Demand Placed, Fulfillment Received (Daily, Percentage)" visibleItems="2 of 2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={percentageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0.1, 0.7]} />
            <Tooltip formatter={(value: number) => value.toFixed(2)} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Demand Received, Fulfillment Shipped (Daily)" visibleItems="2 of 2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shippedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 40]} />
            <Tooltip />
            <Bar dataKey="value" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
