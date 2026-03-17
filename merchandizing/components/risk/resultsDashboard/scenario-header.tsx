"use client"
import { useState, useRef } from "react"
import { ChevronDown, FileText, Check } from "lucide-react"
import { useClickOutside } from "@/hooks/use-click-outside"

interface ScenarioHeaderProps {
  selectedScenario: string
  onScenarioChange: (scenario: string) => void
}

export default function ScenarioHeader({ selectedScenario, onScenarioChange }: ScenarioHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef as React.RefObject<HTMLElement>, () => setIsDropdownOpen(false))
  useClickOutside(actionsRef as React.RefObject<HTMLElement>, () => setIsActionsOpen(false))

  // Additional scenarios for the dropdown
  const completedScenarios = [
    "SIM-1 - Risk Experiment",
    "SIM-2 - Simulation Experiment",
    "SIM-3 - Safety Stock Experiment",
    "SIM-4 - Variation Experiment",
    "SIM-5 - Comparison Experiment"
  ]

  const getScenarioId = (scenario: string) => {
    return scenario.split(" - ")[0]
  }

  const getScenarioType = (scenario: string) => {
    return scenario.split(" - ")[1]
  }

  const getScenarioTag = (scenario: string) => {
    const type = getScenarioType(scenario)
    if (type === "Test Run" || type === "Simulation Experiment") return "Simulation"
    if (type === "Variation Analysis" || type === "Variation Experiment") return "Variation"
    if (type === "Risk Assessment" || type === "Risk Experiment") return "Risk"
    if (type === "Comparison Analysis" || type === "Comparison Experiment") return "Comparison"
    if (type === "Safety Stock Analysis" || type === "Safety Stock Experiment") return "Safety Stock"
    return ""
  }

  const handleScenarioSelect = (scenario: string) => {
    onScenarioChange(scenario)
    setIsDropdownOpen(false)
  }

  return (
    <div className="border-b p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-blue-600">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-600">Current Scenario</div>
            <div className="font-medium">
              <span className="text-gray-900">{getScenarioId(selectedScenario)}</span>{" "}
              <span className="text-gray-500">{getScenarioType(selectedScenario)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Completed
          </span>

          {getScenarioTag(selectedScenario) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {getScenarioTag(selectedScenario)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Change scenario:</span>

          {/* Custom dropdown implementation */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-64 h-9 px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50"
            >
              <span>{selectedScenario}</span>
              <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-50">
                <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b">Completed Scenarios</div>
                <div className="py-1">
                  {completedScenarios.map((scenario) => (
                    <button
                      key={scenario}
                      onClick={() => handleScenarioSelect(scenario)}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-gray-100"
                    >
                      <span>{scenario}</span>
                      {scenario === selectedScenario && <Check className="h-4 w-4 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom actions dropdown */}
        <div className="relative" ref={actionsRef}>
          <button
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            className="flex items-center justify-between h-9 px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50"
          >
            Actions
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>

          {isActionsOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-50">
              <div className="py-1">
                <button className="flex w-full px-3 py-2 text-sm text-left hover:bg-gray-100">View Details</button>
                <button className="flex w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Export Results</button>
                <button className="flex w-full px-3 py-2 text-sm text-left hover:bg-gray-100">Share</button>
                <div className="border-t my-1"></div>
                <button className="flex w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-gray-100">
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
