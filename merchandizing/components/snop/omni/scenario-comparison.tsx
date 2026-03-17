"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { OptimizationScenario } from "./types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface ScenarioComparisonProps {
  scenarios: OptimizationScenario[]
  currentScenarioId: string
}

export function ScenarioComparison({ scenarios, currentScenarioId }: ScenarioComparisonProps) {
  // Prepare data for cost comparison chart
  const costComparisonData = scenarios.map((scenario) => ({
    name: scenario.name,
    totalCost: scenario.totalCost,
    idFixedCost: scenario.model.costBreakdown.idFixedCost,
    idTransport: scenario.model.costBreakdown.idTransport,
    podTransport: scenario.model.costBreakdown.podTransport,
    otherCosts: scenario.model.costBreakdown.idHandling + scenario.model.costBreakdown.podDeliveryProcessing,
    isCurrent: scenario.id === currentScenarioId,
  }))

  // Prepare data for channel distribution comparison
  const channelDistributionData = scenarios.map((scenario) => {
    const totalDemand = scenario.model.totalDemand
    return {
      name: scenario.name,
      convStore: (scenario.model.channelFlows[0].delivered / totalDemand) * 100,
      retailStore: (scenario.model.channelFlows[1].delivered / totalDemand) * 100,
      aps: (scenario.model.channelFlows[2].delivered / totalDemand) * 100,
      home: (scenario.model.channelFlows[3].delivered / totalDemand) * 100,
      isCurrent: scenario.id === currentScenarioId,
    }
  })

  // Prepare data for radar chart
  const radarData = [
    { subject: "Total Cost", Base: 100, Expanded: 97.5, Both: 99.1 },
    { subject: "ID Fixed Cost", Base: 100, Expanded: 100, Both: 222.2 },
    { subject: "ID Transport", Base: 100, Expanded: 100, Both: 87.8 },
    { subject: "POD Transport", Base: 100, Expanded: 97.1, Both: 100 },
    { subject: "APS Usage", Base: 100, Expanded: 200, Both: 100 },
    { subject: "Home Delivery", Base: 100, Expanded: 66.7, Both: 100 },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-purple-800">Scenario Comparison</CardTitle>
          <CardDescription>Comparison of different optimization scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>ID Fixed Cost</TableHead>
                  <TableHead>ID Transport</TableHead>
                  <TableHead>POD Transport</TableHead>
                  <TableHead>Other Costs</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios.map((scenario) => (
                  <TableRow key={scenario.id} className={scenario.id === currentScenarioId ? "bg-purple-50" : ""}>
                    <TableCell className="font-medium">{scenario.name}</TableCell>
                    <TableCell>{scenario.description}</TableCell>
                    <TableCell>${scenario.totalCost.toLocaleString()}</TableCell>
                    <TableCell>${scenario.model.costBreakdown.idFixedCost.toLocaleString()}</TableCell>
                    <TableCell>${scenario.model.costBreakdown.idTransport.toLocaleString()}</TableCell>
                    <TableCell>${scenario.model.costBreakdown.podTransport.toLocaleString()}</TableCell>
                    <TableCell>
                      $
                      {(
                        scenario.model.costBreakdown.idHandling + scenario.model.costBreakdown.podDeliveryProcessing
                      ).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {scenario.id === currentScenarioId ? (
                        <Badge className="bg-purple-500">Current</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          Alternative
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-purple-800">Cost Comparison</CardTitle>
            <CardDescription>Comparison of costs across scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  totalCost: {
                    label: "Total Cost",
                    color: "hsl(var(--chart-1))",
                  },
                  idFixedCost: {
                    label: "ID Fixed Cost",
                    color: "hsl(var(--chart-2))",
                  },
                  idTransport: {
                    label: "ID Transport",
                    color: "hsl(var(--chart-3))",
                  },
                  podTransport: {
                    label: "POD Transport",
                    color: "hsl(var(--chart-4))",
                  },
                  otherCosts: {
                    label: "Other Costs",
                    color: "hsl(var(--chart-5))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="totalCost" name="Total Cost" fill="var(--color-totalCost)" />
                    <Bar dataKey="idFixedCost" name="ID Fixed Cost" fill="var(--color-idFixedCost)" />
                    <Bar dataKey="idTransport" name="ID Transport" fill="var(--color-idTransport)" />
                    <Bar dataKey="podTransport" name="POD Transport" fill="var(--color-podTransport)" />
                    <Bar dataKey="otherCosts" name="Other Costs" fill="var(--color-otherCosts)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-purple-800">Channel Distribution</CardTitle>
            <CardDescription>Comparison of channel usage across scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  convStore: {
                    label: "Conv. Store",
                    color: "hsl(var(--chart-1))",
                  },
                  retailStore: {
                    label: "Retail Store",
                    color: "hsl(var(--chart-2))",
                  },
                  aps: {
                    label: "APS",
                    color: "hsl(var(--chart-3))",
                  },
                  home: {
                    label: "Home",
                    color: "hsl(var(--chart-4))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="convStore" name="Conv. Store" fill="var(--color-convStore)" />
                    <Bar dataKey="retailStore" name="Retail Store" fill="var(--color-retailStore)" />
                    <Bar dataKey="aps" name="APS" fill="var(--color-aps)" />
                    <Bar dataKey="home" name="Home" fill="var(--color-home)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-purple-800">Scenario Performance Comparison</CardTitle>
          <CardDescription>Relative performance across key metrics (Base Case = 100)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 250]} />
                <Radar name="Base Case" dataKey="Base" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Radar name="Expanded APS" dataKey="Expanded" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Radar name="Both IDs Open" dataKey="Both" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
