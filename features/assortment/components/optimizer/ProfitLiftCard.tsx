"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, ArrowRight, HelpCircle, DollarSign, Percent, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfitLiftCardProps {
  currentProfit: number;
  optimizedProfit: number;
  profitLiftPct: number;
  profitLiftAbsolute: number;
  spaceReallocationContribution?: number; // How much of lift from space reallocation
  assortmentChangeContribution?: number; // How much of lift from SKU changes
  isLoading?: boolean;
}

// Animated counter hook
function useAnimatedCounter(
  target: number,
  duration: number = 1000,
  enabled: boolean = true
): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }

    startTime.current = null;
    startValue.current = value;

    const animate = (timestamp: number) => {
      if (!startTime.current) {
        startTime.current = timestamp;
      }

      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const newValue = startValue.current + (target - startValue.current) * eased;
      setValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, enabled]);

  return value;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function ProfitLiftCard({
  currentProfit,
  optimizedProfit,
  profitLiftPct,
  profitLiftAbsolute,
  spaceReallocationContribution = 60,
  assortmentChangeContribution = 40,
  isLoading,
}: ProfitLiftCardProps) {
  const animatedCurrent = useAnimatedCounter(currentProfit, 800, !isLoading);
  const animatedOptimized = useAnimatedCounter(optimizedProfit, 800, !isLoading);
  const animatedLiftPct = useAnimatedCounter(profitLiftPct, 1000, !isLoading);
  const animatedLiftAbs = useAnimatedCounter(profitLiftAbsolute, 1000, !isLoading);

  const isPositive = profitLiftPct >= 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden",
      isPositive ? "border-green-200" : "border-red-200"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Profit Impact</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Expected weekly profit improvement from implementing the optimized
                  assortment. Based on historical sales data and space elasticity models.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main profit display */}
        <div className="flex items-center justify-center gap-4">
          {/* Current Profit */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Current Weekly</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {formatCurrency(animatedCurrent)}
            </p>
          </div>

          {/* Arrow */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            isPositive ? "bg-green-100" : "bg-red-100"
          )}>
            <ArrowRight className={cn(
              "h-5 w-5",
              isPositive ? "text-green-600" : "text-red-600"
            )} />
          </div>

          {/* Optimized Profit */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Optimized Weekly</p>
            <p className={cn(
              "text-2xl font-bold",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(animatedOptimized)}
            </p>
          </div>
        </div>

        {/* Lift metrics */}
        <div className={cn(
          "rounded-lg p-4",
          isPositive ? "bg-green-50" : "bg-red-50"
        )}>
          <div className="flex items-center justify-center gap-6">
            {/* Percentage Lift */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Percent className={cn(
                  "h-4 w-4",
                  isPositive ? "text-green-600" : "text-red-600"
                )} />
                <span className="text-xs font-medium text-muted-foreground">
                  Lift
                </span>
              </div>
              <p className={cn(
                "text-3xl font-bold",
                isPositive ? "text-green-700" : "text-red-700"
              )}>
                {formatPercent(animatedLiftPct)}
              </p>
            </div>

            <div className="w-px h-12 bg-gray-200" />

            {/* Absolute Lift */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className={cn(
                  "h-4 w-4",
                  isPositive ? "text-green-600" : "text-red-600"
                )} />
                <span className="text-xs font-medium text-muted-foreground">
                  Weekly Δ
                </span>
              </div>
              <p className={cn(
                "text-3xl font-bold",
                isPositive ? "text-green-700" : "text-red-700"
              )}>
                {profitLiftAbsolute > 0 ? "+" : ""}{formatCurrency(animatedLiftAbs)}
              </p>
            </div>
          </div>

          {/* Trend indicator */}
          <div className="flex items-center justify-center mt-3 gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-700" : "text-red-700"
            )}>
              {isPositive ? "Positive profit impact" : "Negative profit impact"}
            </span>
          </div>
        </div>

        {/* Contribution breakdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>Contribution Breakdown</span>
          </div>

          <div className="space-y-2">
            {/* Space Reallocation */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Space Reallocation</span>
                  <span className="font-medium">{spaceReallocationContribution}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${spaceReallocationContribution}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Assortment Change */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Assortment Change</span>
                  <span className="font-medium">{assortmentChangeContribution}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${assortmentChangeContribution}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic mt-2">
            Space reallocation optimizes facings for existing SKUs. Assortment change
            adds/removes SKUs to improve profitability.
          </p>
        </div>

        {/* Annual projection */}
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Projected Annual Impact (52 weeks)
          </p>
          <p className={cn(
            "text-xl font-bold",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {profitLiftAbsolute > 0 ? "+" : ""}{formatCurrency(profitLiftAbsolute * 52)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
