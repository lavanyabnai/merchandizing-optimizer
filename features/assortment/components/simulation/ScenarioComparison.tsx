"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  HelpCircle,
  Trophy,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimulationResult } from "@/features/assortment/types";

interface SavedScenario {
  id: string;
  name: string;
  result: SimulationResult;
}

interface ScenarioComparisonProps {
  scenarios: SavedScenario[];
  onRemoveScenario: (id: string) => void;
  isLoading?: boolean;
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function ScenarioComparison({
  scenarios,
  onRemoveScenario,
  isLoading: _isLoading,
}: ScenarioComparisonProps) {
  void _isLoading; // Reserved for future loading state
  // Find best scenario by expected profit
  const bestByProfit = useMemo(() => {
    if (scenarios.length === 0) return null;
    return scenarios.reduce((best, current) =>
      current.result.profitChange > best.result.profitChange ? current : best
    );
  }, [scenarios]);

  // Find lowest risk scenario
  const lowestRisk = useMemo(() => {
    if (scenarios.length === 0) return null;
    return scenarios.reduce((best, current) =>
      current.result.probabilityPositive > best.result.probabilityPositive
        ? current
        : best
    );
  }, [scenarios]);

  // Generate recommendation
  const recommendation = useMemo(() => {
    if (scenarios.length < 2) return null;

    const best = bestByProfit;
    const safest = lowestRisk;

    if (!best || !safest) return null;

    if (best.id === safest.id) {
      return {
        type: "clear",
        text: `"${best.name}" has both the highest expected profit and lowest risk.`,
      };
    }

    const profitDiff = best.result.profitChange - safest.result.profitChange;
    const riskDiff =
      (safest.result.probabilityPositive - best.result.probabilityPositive) * 100;

    if (riskDiff > 20) {
      return {
        type: "tradeoff",
        text: `"${best.name}" offers ${formatCurrency(profitDiff)} more weekly profit, but "${safest.name}" is ${riskDiff.toFixed(0)}% more likely to succeed. Consider your risk tolerance.`,
      };
    }

    return {
      type: "slight",
      text: `"${best.name}" has higher expected value with similar risk profile to "${safest.name}".`,
    };
  }, [scenarios, bestByProfit, lowestRisk]);

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Run simulations and save scenarios to compare them here.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Compare up to 3 scenarios side-by-side
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Scenario Comparison
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Compare key metrics across saved scenarios. The best scenario
                  depends on your risk tolerance and business objectives.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comparison Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Scenario</TableHead>
                {scenarios.map((scenario) => (
                  <TableHead key={scenario.id} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="truncate max-w-[100px]">{scenario.name}</span>
                      {scenario.id === bestByProfit?.id && (
                        <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => onRemoveScenario(scenario.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Scenario Type */}
              <TableRow>
                <TableCell className="font-medium">Type</TableCell>
                {scenarios.map((scenario) => (
                  <TableCell key={scenario.id} className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {scenario.result.scenarioType.replace("_", " ")}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>

              {/* Expected Profit Change */}
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    Profit Change
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Expected weekly profit change vs baseline</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                {scenarios.map((scenario) => {
                  const isBest = scenario.id === bestByProfit?.id && scenarios.length > 1;
                  return (
                    <TableCell
                      key={scenario.id}
                      className={cn(
                        "text-center font-bold",
                        scenario.result.profitChange >= 0 ? "text-green-600" : "text-red-600",
                        isBest && "bg-green-50"
                      )}
                    >
                      {formatCurrency(scenario.result.profitChange)}
                      <span className="text-xs font-normal ml-1">
                        ({formatPercent(scenario.result.profitChangePct)})
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Revenue Change */}
              <TableRow>
                <TableCell className="font-medium">Revenue Change</TableCell>
                {scenarios.map((scenario) => (
                  <TableCell
                    key={scenario.id}
                    className={cn(
                      "text-center",
                      scenario.result.revenueChange >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatCurrency(scenario.result.revenueChange)}
                  </TableCell>
                ))}
              </TableRow>

              {/* P(Positive) */}
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    Success Probability
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Probability of profit improvement</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                {scenarios.map((scenario) => {
                  const isSafest = scenario.id === lowestRisk?.id && scenarios.length > 1;
                  const prob = scenario.result.probabilityPositive * 100;
                  return (
                    <TableCell
                      key={scenario.id}
                      className={cn(
                        "text-center font-medium",
                        isSafest && "bg-blue-50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {prob >= 70 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                        ) : prob >= 50 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-yellow-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        {prob.toFixed(0)}%
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* 5th Percentile (Downside) */}
              <TableRow>
                <TableCell className="font-medium">
                  Worst Case (5th %ile)
                </TableCell>
                {scenarios.map((scenario) => (
                  <TableCell
                    key={scenario.id}
                    className={cn(
                      "text-center text-sm",
                      scenario.result.profitPercentiles.p5 >= scenario.result.baselineProfit
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {formatCurrency(scenario.result.profitPercentiles.p5)}
                  </TableCell>
                ))}
              </TableRow>

              {/* 95th Percentile (Upside) */}
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium">
                  Best Case (95th %ile)
                </TableCell>
                {scenarios.map((scenario) => (
                  <TableCell key={scenario.id} className="text-center text-sm text-green-600">
                    {formatCurrency(scenario.result.profitPercentiles.p95)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Risk Level */}
              <TableRow>
                <TableCell className="font-medium">Risk Level</TableCell>
                {scenarios.map((scenario) => {
                  const prob = scenario.result.probabilityPositive;
                  const riskLevel = prob >= 0.8 ? "Low" : prob >= 0.5 ? "Medium" : "High";
                  const riskColor =
                    prob >= 0.8
                      ? "bg-green-100 text-green-700"
                      : prob >= 0.5
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700";

                  return (
                    <TableCell key={scenario.id} className="text-center">
                      <Badge variant="outline" className={cn("text-xs", riskColor)}>
                        {riskLevel}
                      </Badge>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <Alert className="bg-blue-50 border-blue-200">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Recommendation:</strong> {recommendation.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-yellow-500" />
            Highest Profit
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-50 border border-green-200" />
            Best Value
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200" />
            Lowest Risk
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
