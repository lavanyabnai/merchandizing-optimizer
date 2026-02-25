"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export interface AttributeData {
  attribute: string;
  importance: number;
  description: string;
}

interface AttributeImportanceProps {
  data: AttributeData[];
  isLoading?: boolean;
}

// Default attribute importance data
export const DEFAULT_ATTRIBUTE_DATA: AttributeData[] = [
  {
    attribute: "Subcategory",
    importance: 0.36,
    description: "First, shoppers decide what type of beverage they want (soda, juice, water, or energy drink)",
  },
  {
    attribute: "Brand",
    importance: 0.28,
    description: "Next, they choose their preferred brand within that type",
  },
  {
    attribute: "Size/Pack",
    importance: 0.21,
    description: "Then they pick the right size for their occasion (single serve vs. multi-pack)",
  },
  {
    attribute: "Price",
    importance: 0.15,
    description: "Finally, price influences the final selection",
  },
];

// Gradient colors from dark to light based on importance
const COLORS = ["#2E86AB", "#3B9BC9", "#5BB5D5", "#7FCFE1"];

export function AttributeImportance({
  data = DEFAULT_ATTRIBUTE_DATA,
  isLoading,
}: AttributeImportanceProps) {
  // Sort by importance descending for display, but reverse for horizontal bar chart
  const sortedData = [...data].sort((a, b) => a.importance - b.importance);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Consumer Decision Hierarchy
          </CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Shows the order in which shoppers make choices. Attributes with higher
                  importance are decided first in the purchase journey.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 0.45]}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
            />
            <YAxis
              type="category"
              dataKey="attribute"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              width={80}
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${(value * 100).toFixed(0)}%`,
                props.payload.description,
              ]}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[sortedData.length - 1 - index] || COLORS[0]}
                />
              ))}
              <LabelList
                dataKey="importance"
                position="right"
                formatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                style={{ fontSize: 11, fontWeight: 500, fill: "#374151" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Explanation */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
          <p className="font-medium text-foreground mb-2">The Decision Hierarchy:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
            {[...data].sort((a, b) => b.importance - a.importance).map((item, index) => (
              <li key={item.attribute}>
                <strong className="text-foreground">{item.attribute}</strong> ({(item.importance * 100).toFixed(0)}%) - {item.description}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground italic">
            <strong>Implication:</strong> Ensure strong representation at each level before expanding depth.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
