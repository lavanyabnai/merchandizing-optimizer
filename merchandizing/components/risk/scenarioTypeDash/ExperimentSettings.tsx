"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Beaker, TrendingUp, AlertTriangle, BarChart4, Package } from "lucide-react"
import VariationExperiment from "@/components/risk/scenarioTypeDash/variation-experiment"
import SimulationExperiment from "@/components/risk/scenarioTypeDash/simulation-experiment"
import RiskAnalysisExperiment from "@/components/risk/scenarioTypeDash/risk-analysis-experiment"
import ComparisonExperiment from "@/components/risk/scenarioTypeDash/comparison-experiment"
import SafetyStockExperiment from "@/components/risk/scenarioTypeDash/safety-stock-experiment"

type ExperimentType = "variation" | "simulation" | "risk" | "comparison" | "safety"

export default function ExperimentSettings() {
  const [experimentType, setExperimentType] = useState<ExperimentType>("variation")
  const [step, setStep] = useState<"select" | "configure">("select")
  const [experimentName, setExperimentName] = useState("")
  const [experimentDescription, setExperimentDescription] = useState("")

  const handleTypeSelect = (type: ExperimentType) => {
    setExperimentType(type)
  }

  const handleContinue = () => {
    setStep("configure")
  }

  const handleBack = () => {
    setStep("select")
  }

  const renderExperimentForm = () => {
    switch (experimentType) {
      case "variation":
        return <VariationExperiment />
      case "simulation":
        return <SimulationExperiment />
      case "risk":
        return <RiskAnalysisExperiment />
      case "comparison":
        return <ComparisonExperiment />
      case "safety":
        return <SafetyStockExperiment />
      default:
        return <div>Select an experiment type</div>
    }
  }

  return (
    <div className="w-full">
      {step === "select" ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Experiment</CardTitle>
            <CardDescription>Select the type of experiment you want to create</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="experiment-name">Experiment Name</Label>
              <Input
                id="experiment-name"
                placeholder="Enter a name for your experiment"
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="experiment-description">Description (Optional)</Label>
              <Textarea
                id="experiment-description"
                placeholder="Describe the purpose of this experiment"
                value={experimentDescription}
                onChange={(e) => setExperimentDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <Label>Experiment Type</Label>
              <RadioGroup
                value={experimentType}
                onValueChange={(value) => handleTypeSelect(value as ExperimentType)}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                <ExperimentTypeCard
                  value="variation"
                  title="Variation Experiment"
                  description="Test how variations in key parameters affect your supply chain"
                  icon={<TrendingUp className="h-6 w-6" />}
                  selected={experimentType === "variation"}
                />
                <ExperimentTypeCard
                  value="simulation"
                  title="Simulation Experiment"
                  description="Run detailed simulations of your supply chain operations"
                  icon={<Beaker className="h-6 w-6" />}
                  selected={experimentType === "simulation"}
                />
                <ExperimentTypeCard
                  value="risk"
                  title="Risk Analysis"
                  description="Identify and quantify risks in your supply chain"
                  icon={<AlertTriangle className="h-6 w-6" />}
                  selected={experimentType === "risk"}
                />
                <ExperimentTypeCard
                  value="comparison"
                  title="Comparison Experiment"
                  description="Compare different scenarios or strategies side by side"
                  icon={<BarChart4 className="h-6 w-6" />}
                  selected={experimentType === "comparison"}
                />
                <ExperimentTypeCard
                  value="safety"
                  title="Safety Stock Experiment"
                  description="Optimize inventory levels and safety stock policies"
                  icon={<Package className="h-6 w-6" />}
                  selected={experimentType === "safety"}
                />
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleContinue} disabled={!experimentName || !experimentType}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{experimentName}</h2>
              {experimentDescription && <p className="text-sm text-gray-500">{experimentDescription}</p>}
            </div>
            <Button variant="outline" onClick={handleBack}>
              Back to Selection
            </Button>
          </div>
          {renderExperimentForm()}
        </div>
      )}
    </div>
  )
}

interface ExperimentTypeCardProps {
  value: string
  title: string
  description: string
  icon: React.ReactNode
  selected: boolean
}

function ExperimentTypeCard({ value, title, description, icon, selected }: ExperimentTypeCardProps) {
  return (
    <Label
      htmlFor={`experiment-type-${value}`}
      className={`flex cursor-pointer flex-col rounded-lg border p-4 hover:bg-gray-50 ${
        selected ? "border-blue-500 bg-blue-50" : "border-gray-200"
      }`}
    >
      <RadioGroupItem value={value} id={`experiment-type-${value}`} className="sr-only" />
      <div className="flex items-center gap-2">
        <div className={`rounded-full p-2 ${selected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </Label>
  )
}
