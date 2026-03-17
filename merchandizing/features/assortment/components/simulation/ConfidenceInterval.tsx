"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceIntervalProps {
  label: string;
  p5: number;
  p50: number;
  p95: number;
  baseline?: number;
  isProfit?: boolean;
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

export function ConfidenceInterval({
  label,
  p5,
  p50,
  p95,
  baseline = 0,
  isProfit: _isProfit = false,
  isLoading,
}: ConfidenceIntervalProps) {
  void _isProfit; // Reserved for future styling differences
  const change5 = p5 - baseline;
  const change50 = p50 - baseline;
  const change95 = p95 - baseline;

  const ciWidth = p95 - p5;

  // Determine risk level based on CI characteristics
  const riskLevel = (() => {
    if (p5 >= baseline) return "low"; // Even worst case is positive
    if (p50 >= baseline && p5 < baseline) return "medium"; // Expected is positive, but risk exists
    return "high"; // Expected value is negative
  })();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <Skeleton className="h-[120px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  90% of outcomes fall between the 5th and 95th percentiles.
                  The median (50th) represents the most likely outcome.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Range */}
        <div className="relative h-8">
          {/* Background track */}
          <div className="absolute inset-0 rounded-full bg-muted" />

          {/* CI range highlight */}
          <div
            className={cn(
              "absolute h-full rounded-full",
              riskLevel === "low"
                ? "bg-green-200"
                : riskLevel === "medium"
                ? "bg-yellow-200"
                : "bg-red-200"
            )}
            style={{
              left: `${Math.max(0, ((p5 - (p5 - ciWidth * 0.2)) / (ciWidth * 1.4)) * 100)}%`,
              right: `${Math.max(0, 100 - ((p95 - (p5 - ciWidth * 0.2)) / (ciWidth * 1.4)) * 100)}%`,
            }}
          />

          {/* Markers */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded"
            style={{ left: `${((p5 - (p5 - ciWidth * 0.2)) / (ciWidth * 1.4)) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-8 bg-green-600 rounded"
            style={{ left: `${((p50 - (p5 - ciWidth * 0.2)) / (ciWidth * 1.4)) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded"
            style={{ left: `${((p95 - (p5 - ciWidth * 0.2)) / (ciWidth * 1.4)) * 100}%` }}
          />
        </div>

        {/* Values */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Pessimistic
            </p>
            <p className="text-sm font-bold text-red-600">{formatCurrency(p5)}</p>
            <p className={cn(
              "text-xs",
              change5 >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {change5 >= 0 ? "+" : ""}{formatCurrency(change5)}
            </p>
          </div>

          <div className="space-y-1 border-x px-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Expected
            </p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(p50)}</p>
            <p className={cn(
              "text-xs font-medium",
              change50 >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {change50 >= 0 ? "+" : ""}{formatCurrency(change50)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Optimistic
            </p>
            <p className="text-sm font-bold text-green-600">{formatCurrency(p95)}</p>
            <p className={cn(
              "text-xs",
              change95 >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {change95 >= 0 ? "+" : ""}{formatCurrency(change95)}
            </p>
          </div>
        </div>

        {/* CI Width */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t">
          <span className="text-xs text-muted-foreground">90% CI Width:</span>
          <span className="text-xs font-medium">{formatCurrency(ciWidth)}</span>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              riskLevel === "low"
                ? "border-green-300 text-green-700 bg-green-50"
                : riskLevel === "medium"
                ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                : "border-red-300 text-red-700 bg-red-50"
            )}
          >
            {riskLevel === "low" ? "Low Risk" : riskLevel === "medium" ? "Med Risk" : "High Risk"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Probability badges component
interface ProbabilityBadgesProps {
  probPositive: number;
  probNegative: number;
  probBreakeven?: number;
  isLoading?: boolean;
}

export function ProbabilityBadges({
  probPositive,
  probNegative,
  probBreakeven: _probBreakeven = 0,
  isLoading,
}: ProbabilityBadgesProps) {
  void _probBreakeven; // Reserved for future use
  if (isLoading) {
    return (
      <div className="flex gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 py-1.5 px-3",
                probPositive >= 0.7
                  ? "border-green-300 text-green-700 bg-green-50"
                  : probPositive >= 0.5
                  ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                  : "border-red-300 text-red-700 bg-red-50"
              )}
            >
              {probPositive >= 0.7 ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : probPositive >= 0.5 ? (
                <Minus className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              {(probPositive * 100).toFixed(0)}% chance positive
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Probability that this scenario improves profit vs baseline
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 py-1.5 px-3",
                probNegative <= 0.1
                  ? "border-green-300 text-green-700 bg-green-50"
                  : probNegative <= 0.3
                  ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                  : "border-red-300 text-red-700 bg-red-50"
              )}
            >
              {probNegative <= 0.1 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : probNegative <= 0.3 ? (
                <Minus className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {(probNegative * 100).toFixed(0)}% chance negative
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Probability that this scenario decreases profit vs baseline
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
