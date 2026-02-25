"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, PlusCircle, LayoutGrid, DollarSign, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScenarioType } from "@/features/assortment/types";

interface ScenarioConfig {
  type: ScenarioType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    type: "remove_sku",
    label: "Remove SKU(s)",
    description: "What if we delist these products?",
    icon: Trash2,
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100 border-red-200",
  },
  {
    type: "add_sku",
    label: "Add New SKU",
    description: "What if we introduce a new product?",
    icon: PlusCircle,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
  },
  {
    type: "change_facings",
    label: "Change Facings",
    description: "What if we reallocate shelf space?",
    icon: LayoutGrid,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
  },
  {
    type: "change_price",
    label: "Change Price",
    description: "What if we adjust pricing?",
    icon: DollarSign,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
  },
];

interface ScenarioSelectorProps {
  selectedScenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
  disabled?: boolean;
}

export function ScenarioSelector({
  selectedScenario,
  onScenarioChange,
  disabled = false,
}: ScenarioSelectorProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium">Scenario Type</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Choose what type of change you want to simulate. Each scenario
                  type models different impacts on revenue and profit.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = selectedScenario === scenario.type;

            return (
              <Button
                key={scenario.type}
                variant="outline"
                onClick={() => onScenarioChange(scenario.type)}
                disabled={disabled}
                className={cn(
                  "h-auto flex-col items-start p-3 gap-1 transition-all",
                  isSelected
                    ? `${scenario.bgColor} border-2`
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={cn("h-4 w-4", scenario.color)} />
                  <span className={cn(
                    "text-sm font-medium",
                    isSelected && scenario.color
                  )}>
                    {scenario.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-left font-normal">
                  {scenario.description}
                </p>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export { SCENARIOS };
export type { ScenarioConfig };
