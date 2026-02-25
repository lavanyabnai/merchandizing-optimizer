"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRightLeft,
  ShoppingCart,
  LogOut,
} from "lucide-react";

export interface SwitchingBehaviorData {
  type: string;
  probability: number;
  description: string;
  icon: "sameBrandFlavor" | "sameBrandSize" | "differentBrand" | "differentCategory" | "walkAway";
}

interface SwitchingBehaviorProps {
  data: SwitchingBehaviorData[];
  isLoading?: boolean;
}

// Default switching behavior data
export const DEFAULT_SWITCHING_DATA: SwitchingBehaviorData[] = [
  {
    type: "Same brand, different flavor",
    probability: 0.27,
    description: "Customer stays loyal to the brand but picks a different flavor/variant",
    icon: "sameBrandFlavor",
  },
  {
    type: "Same brand, different size",
    probability: 0.23,
    description: "Customer picks a different pack size of the same brand",
    icon: "sameBrandSize",
  },
  {
    type: "Different brand, same category",
    probability: 0.20,
    description: "Customer switches to a competing brand within the same subcategory",
    icon: "differentBrand",
  },
  {
    type: "Different category",
    probability: 0.21,
    description: "Customer switches to a completely different beverage type",
    icon: "differentCategory",
  },
  {
    type: "Walk away",
    probability: 0.09,
    description: "Customer leaves without making a purchase - this is lost revenue!",
    icon: "walkAway",
  },
];

// Colors for donut chart
const COLORS = {
  sameBrandFlavor: "#28A745",
  sameBrandSize: "#28A745",
  differentBrand: "#FFC107",
  differentCategory: "#FFC107",
  walkAway: "#DC3545",
};

// Icons for each behavior type
const ICONS = {
  sameBrandFlavor: RefreshCw,
  sameBrandSize: RefreshCw,
  differentBrand: ArrowRightLeft,
  differentCategory: ShoppingCart,
  walkAway: LogOut,
};

export function SwitchingBehavior({
  data = DEFAULT_SWITCHING_DATA,
  isLoading,
}: SwitchingBehaviorProps) {
  // Calculate metrics
  const walkAwayRate = data.find((d) => d.icon === "walkAway")?.probability || 0;
  const stayRate = 1 - walkAwayRate;
  const sameProductRate = data
    .filter((d) => d.icon === "sameBrandFlavor" || d.icon === "sameBrandSize")
    .reduce((sum, d) => sum + d.probability, 0);

  // Prepare data for donut chart
  const chartData = data.map((item) => ({
    name: item.type,
    value: item.probability,
    color: COLORS[item.icon],
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Out-of-Stock Behavior
          </CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Shows what customers do when their preferred item is unavailable.
                  Understanding this helps prioritize stockout prevention.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Donut Chart */}
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, "Probability"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="rounded-lg bg-green-50 p-2 text-center">
                <div className="text-lg font-bold text-green-700">{(stayRate * 100).toFixed(0)}%</div>
                <div className="text-xs text-green-600">Retained Sales</div>
              </div>
              <div className="rounded-lg bg-red-50 p-2 text-center">
                <div className="text-lg font-bold text-red-700">{(walkAwayRate * 100).toFixed(0)}%</div>
                <div className="text-xs text-red-600">Lost Sales</div>
              </div>
            </div>
          </div>

          {/* Behavior cards */}
          <div className="space-y-2">
            {data.map((item) => {
              const Icon = ICONS[item.icon];
              const isWalkAway = item.icon === "walkAway";
              const isSameBrand = item.icon === "sameBrandFlavor" || item.icon === "sameBrandSize";

              return (
                <TooltipProvider key={item.type}>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/50 ${
                          isWalkAway ? "border-red-200 bg-red-50/50" : ""
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isWalkAway
                              ? "bg-red-100 text-red-600"
                              : isSameBrand
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{item.type}</div>
                        </div>
                        <div className={`text-sm font-bold ${isWalkAway ? "text-red-600" : ""}`}>
                          {(item.probability * 100).toFixed(0)}%
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-xs">{item.description}</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        {/* Critical insight */}
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Critical: {(walkAwayRate * 100).toFixed(0)}% Walk-Away Rate</strong>
            <br />
            <span className="text-xs">
              When preferred item is OOS: <strong>{(stayRate * 100).toFixed(0)}%</strong> substitute (sale retained),
              but <strong>{(walkAwayRate * 100).toFixed(0)}%</strong> leave without buying.
              Prioritize in-stock rates for hero SKUs.
            </span>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
