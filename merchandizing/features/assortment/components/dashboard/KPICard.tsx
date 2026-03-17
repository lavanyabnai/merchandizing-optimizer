"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type KPIFormat = "currency" | "percent" | "number" | "decimal";
export type KPITrend = "up" | "down" | "neutral";

export interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  format: KPIFormat;
  icon?: React.ReactNode;
  trend?: KPITrend;
  tooltip?: string;
  suffix?: string;
  className?: string;
}

function formatValue(value: number, format: KPIFormat, suffix?: string): string {
  let formatted: string;

  switch (format) {
    case "currency":
      formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
      break;
    case "percent":
      formatted = `${value.toFixed(1)}%`;
      break;
    case "decimal":
      formatted = `${value.toFixed(2)}x`;
      break;
    case "number":
    default:
      formatted = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(value);
      break;
  }

  return suffix ? `${formatted} ${suffix}` : formatted;
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function getTrendFromChange(change: number): KPITrend {
  if (change > 0.5) return "up";
  if (change < -0.5) return "down";
  return "neutral";
}

export function KPICard({
  title,
  value,
  previousValue,
  format,
  icon,
  trend,
  tooltip,
  suffix,
  className,
}: KPICardProps) {
  const change = previousValue !== undefined ? calculateChange(value, previousValue) : undefined;
  const computedTrend = trend ?? (change !== undefined ? getTrendFromChange(change) : undefined);

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-500",
  };

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight">
                {formatValue(value, format, suffix)}
              </p>
              {change !== undefined && computedTrend && (
                <div className={cn("flex items-center gap-0.5 text-sm", trendColors[computedTrend])}>
                  {React.createElement(TrendIcon[computedTrend], { className: "h-3.5 w-3.5" })}
                  <span>{Math.abs(change).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Import React for createElement
import React from "react";
