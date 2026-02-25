"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, HelpCircle, Settings2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimulationConfig as SimulationConfigType } from "@/features/assortment/types";

interface SimulationConfigProps {
  config: SimulationConfigType;
  onChange: (config: SimulationConfigType) => void;
  disabled?: boolean;
}

const DEFAULT_CONFIG: SimulationConfigType = {
  numTrials: 5000,
  demandCv: 0.15,
  priceElasticityMean: -2.0,
  priceElasticityStd: 0.3,
  spaceElasticityStd: 0.1,
  walkRateMean: 0.09,
  walkRateStd: 0.02,
};

export function SimulationConfig({
  config,
  onChange,
  disabled = false,
}: SimulationConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof SimulationConfigType, value: number) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
          className="w-full justify-between p-0 h-auto hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              Simulation Settings
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">
                    Advanced Monte Carlo simulation parameters. Default values
                    work well for most scenarios.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 pt-2">
          {/* Understanding Monte Carlo */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-foreground mb-1">
                  Understanding Monte Carlo Simulation
                </p>
                <p className="text-xs">
                  Monte Carlo generates thousands of random demand scenarios to
                  understand the range of possible outcomes. More trials = more
                  accurate confidence intervals but slower execution.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Number of Trials */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Number of Trials</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Number of random demand scenarios to generate.
                          5,000 is usually sufficient for reliable estimates.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-sm font-bold text-primary">
                  {config.numTrials.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[config.numTrials]}
                onValueChange={([v]) => handleChange("numTrials", v)}
                min={1000}
                max={10000}
                step={1000}
                disabled={disabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1,000 (fast)</span>
                <span>10,000 (accurate)</span>
              </div>
            </div>

            {/* Demand Uncertainty */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Demand Uncertainty (CV)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Coefficient of variation (std/mean). Higher = more
                          uncertain demand. 0.15 is typical for beverages.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-sm font-bold text-primary">
                  {(config.demandCv * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[config.demandCv]}
                onValueChange={([v]) => handleChange("demandCv", v)}
                min={0.05}
                max={0.30}
                step={0.01}
                disabled={disabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5% (stable)</span>
                <span>30% (volatile)</span>
              </div>
            </div>

            {/* Walk-Away Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Walk-Away Rate</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Probability that a customer leaves without buying if
                          their preferred item is unavailable. Industry avg: 8-12%.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-sm font-bold text-primary">
                  {(config.walkRateMean * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[config.walkRateMean]}
                onValueChange={([v]) => handleChange("walkRateMean", v)}
                min={0.05}
                max={0.20}
                step={0.01}
                disabled={disabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5% (loyal)</span>
                <span>20% (switchy)</span>
              </div>
            </div>

            {/* Random Seed */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Random Seed</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        For reproducible results. Same seed = same random
                        scenarios across runs.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                type="number"
                min={1}
                max={9999}
                value={config.randomSeed || 42}
                onChange={(e) => handleChange("randomSeed", parseInt(e.target.value) || 42)}
                disabled={disabled}
                className="w-32"
              />
            </div>
          </div>

          {/* Summary */}
          <p className="text-xs text-muted-foreground text-center border-t pt-4">
            Simulation will generate <strong>{config.numTrials.toLocaleString()}</strong> demand
            scenarios with <strong>{(config.demandCv * 100).toFixed(0)}%</strong> uncertainty
            and <strong>{(config.walkRateMean * 100).toFixed(0)}%</strong> walk-away rate
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export { DEFAULT_CONFIG };
