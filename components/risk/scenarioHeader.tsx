"use client"

import { FileText, CheckCircle2, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define scenario type
export type Scenario = {
  id: string
  description: string
  status: string
  type: string
}

// ScenarioDropdown component integrated directly into the file
function ScenarioDropdown({
  selectedScenario,
  scenarios,
  onScenarioChange,
}: {
  selectedScenario: Scenario | null
  scenarios: Scenario[]
  onScenarioChange: (scenarioId: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Change scenario:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[260px] justify-between">
            {selectedScenario ? `${selectedScenario.id} - ${selectedScenario.description}` : "Select a scenario"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[260px]">
          <DropdownMenuLabel>Completed Scenarios</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {scenarios.map((scenario) => (
            <DropdownMenuItem
              key={scenario.id}
              onClick={() => onScenarioChange(scenario.id)}
              className="flex items-center"
            >
              <div className="w-4 mr-2">
                {selectedScenario?.id === scenario.id && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
              </div>
              {scenario.id} - {scenario.description}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

interface ScenarioHeaderProps {
  selectedScenario: Scenario | null
  scenarios: Scenario[]
  onScenarioChange: (scenarioId: string) => void
}

export default function ScenarioHeader({ selectedScenario, scenarios, onScenarioChange }: ScenarioHeaderProps) {
  return (
    <div className="bg-white border-b p-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <div>
            <h3 className="text-sm font-medium">Current Scenario</h3>
            {selectedScenario && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{selectedScenario.id}</span>
                <span className="text-sm text-gray-500">{selectedScenario.description}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {selectedScenario.status}
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Using the integrated ScenarioDropdown component */}
          <ScenarioDropdown
            selectedScenario={selectedScenario}
            scenarios={scenarios}
            onScenarioChange={onScenarioChange}
          />
          <Button variant="outline" size="sm">
            Actions
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
