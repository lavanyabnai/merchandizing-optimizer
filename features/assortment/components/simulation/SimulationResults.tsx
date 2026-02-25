"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HelpCircle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceInterval, ProbabilityBadges } from "./ConfidenceInterval";
import { DualDistributionChart } from "./DistributionChart";
import type { SimulationResult } from "@/features/assortment/types";

interface SimulationResultsProps {
  result: SimulationResult;
  isLoading?: boolean;
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeValue?: number;
  icon: React.ReactNode;
  helpText: string;
  isLoading?: boolean;
}

function MetricCard({ title, value, change, changeValue, icon, helpText, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">{title}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={cn(
                "text-sm font-medium",
                changeValue !== undefined && changeValue >= 0
                  ? "text-green-600"
                  : "text-red-600"
              )}>
                {change}
              </p>
            )}
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            changeValue !== undefined && changeValue >= 0
              ? "bg-green-100 text-green-600"
              : changeValue !== undefined
              ? "bg-red-100 text-red-600"
              : "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SimulationResults({ result, isLoading }: SimulationResultsProps) {
  // Generate synthetic trial data for charts (in real implementation, this comes from API)
  const trialData = useMemo(() => {
    if (!result) return { revenue: [], profit: [] };

    // Generate synthetic distribution data based on stats
    const generateTrials = (mean: number, std: number, count: number) => {
      const trials: number[] = [];
      for (let i = 0; i < count; i++) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        trials.push(mean + z * std);
      }
      return trials;
    };

    return {
      revenue: generateTrials(
        result.revenueStats.mean,
        result.revenueStats.std,
        result.trialsCompleted
      ),
      profit: generateTrials(
        result.profitStats.mean,
        result.profitStats.std,
        result.trialsCompleted
      ),
    };
  }, [result]);

  // Determine risk assessment
  const riskAssessment = useMemo(() => {
    if (!result) return { level: "unknown", color: "gray", description: "" };

    const probPositive = result.probabilityPositive;
    const profitChangeMean = result.profitChange;

    if (probPositive >= 0.8 && profitChangeMean > 0) {
      return {
        level: "Low",
        color: "green",
        description: "High confidence in positive outcome",
      };
    }
    if (probPositive >= 0.5 && probPositive < 0.8) {
      return {
        level: "Medium",
        color: "yellow",
        description: "Moderate uncertainty in outcome",
      };
    }
    return {
      level: "High",
      color: "red",
      description: "Significant risk of negative outcome",
    };
  }, [result]);

  if (isLoading || !result) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scenario Description */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Scenario:</strong> {result.scenarioDescription}
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Expected Revenue"
          value={formatCurrency(result.revenueStats.mean)}
          change={`${formatPercent(result.revenueChangePct)} (${formatCurrency(result.revenueChange)})`}
          changeValue={result.revenueChange}
          icon={<DollarSign className="h-5 w-5" />}
          helpText="Average weekly revenue across all simulation trials"
        />

        <MetricCard
          title="Expected Profit"
          value={formatCurrency(result.profitStats.mean)}
          change={`${formatPercent(result.profitChangePct)} (${formatCurrency(result.profitChange)})`}
          changeValue={result.profitChange}
          icon={<TrendingUp className="h-5 w-5" />}
          helpText="Average weekly profit across all simulation trials"
        />

        <MetricCard
          title="P(Profit Increase)"
          value={`${(result.probabilityPositive * 100).toFixed(0)}%`}
          icon={<Target className="h-5 w-5" />}
          helpText="Probability that this scenario improves profit vs baseline. Aim for >70%."
          changeValue={result.probabilityPositive >= 0.5 ? 1 : -1}
        />

        <MetricCard
          title="Profit Std Dev"
          value={formatCurrency(result.profitStats.std)}
          icon={<BarChart3 className="h-5 w-5" />}
          helpText="Standard deviation of profit outcomes. Higher = more uncertainty."
        />
      </div>

      {/* Probability Badges */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <ProbabilityBadges
          probPositive={result.probabilityPositive}
          probNegative={result.probabilityNegative}
          probBreakeven={result.probabilityBreakeven}
        />

        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 py-1.5 px-3",
            riskAssessment.color === "green"
              ? "border-green-300 text-green-700 bg-green-50"
              : riskAssessment.color === "yellow"
              ? "border-yellow-300 text-yellow-700 bg-yellow-50"
              : "border-red-300 text-red-700 bg-red-50"
          )}
        >
          {riskAssessment.color === "green" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : riskAssessment.color === "yellow" ? (
            <AlertTriangle className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {riskAssessment.level} Risk: {riskAssessment.description}
        </Badge>
      </div>

      {/* Distribution Chart */}
      <DualDistributionChart
        revenueData={trialData.revenue}
        profitData={trialData.profit}
        revenueP5={result.revenuePercentiles.p5}
        revenueP50={result.revenuePercentiles.p50}
        revenueP95={result.revenuePercentiles.p95}
        profitP5={result.profitPercentiles.p5}
        profitP50={result.profitPercentiles.p50}
        profitP95={result.profitPercentiles.p95}
        baselineRevenue={result.baselineRevenue}
        baselineProfit={result.baselineProfit}
      />

      {/* Confidence Intervals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConfidenceInterval
          label="Revenue Confidence Interval"
          p5={result.revenuePercentiles.p5}
          p50={result.revenuePercentiles.p50}
          p95={result.revenuePercentiles.p95}
          baseline={result.baselineRevenue}
        />

        <ConfidenceInterval
          label="Profit Confidence Interval"
          p5={result.profitPercentiles.p5}
          p50={result.profitPercentiles.p50}
          p95={result.profitPercentiles.p95}
          baseline={result.baselineProfit}
          isProfit
        />
      </div>

      {/* Interpretation */}
      {result.profitChange >= 0 ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Positive Outlook:</strong> This scenario is expected to{" "}
            <strong>increase</strong> weekly profit by {formatCurrency(result.profitChange)} (
            {formatPercent(result.profitChangePct)}). There is a{" "}
            <strong>{(result.probabilityPositive * 100).toFixed(0)}%</strong> probability of
            profit improvement over baseline.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Caution:</strong> This scenario is expected to{" "}
            <strong>decrease</strong> weekly profit by {formatCurrency(Math.abs(result.profitChange))} (
            {formatPercent(result.profitChangePct)}). Only{" "}
            <strong>{(result.probabilityPositive * 100).toFixed(0)}%</strong> probability of
            profit improvement.
          </AlertDescription>
        </Alert>
      )}

      {/* Execution Info */}
      <p className="text-xs text-muted-foreground text-center">
        Simulation completed {result.trialsCompleted.toLocaleString()} trials in{" "}
        {(result.executionTimeMs / 1000).toFixed(2)}s
      </p>
    </div>
  );
}
