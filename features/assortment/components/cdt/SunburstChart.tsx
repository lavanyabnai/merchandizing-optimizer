"use client";

import { useState, useMemo, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronRight, Home, Info } from "lucide-react";

export interface CDTNode {
  id: string;
  name: string;
  value?: number;
  children?: CDTNode[];
  color?: string;
  parent?: string;
}

interface SunburstChartProps {
  data: CDTNode;
  isLoading?: boolean;
}

// Color palette for subcategories
const SUBCATEGORY_COLORS: Record<string, string> = {
  Cola: "#2E86AB",
  "Lemon-Lime": "#28A745",
  Orange: "#FF8C00",
  "Root Beer": "#8B4513",
  "Sparkling Water": "#00CED1",
  Energy: "#DC143C",
  Beverages: "#6366F1",
  Default: "#9333EA",
};

function getColor(name: string, parentColor?: string): string {
  if (SUBCATEGORY_COLORS[name]) return SUBCATEGORY_COLORS[name];
  if (parentColor) {
    // Slightly vary the parent color
    return parentColor;
  }
  return SUBCATEGORY_COLORS.Default;
}

// Recursively calculate total value of a node (sum of all leaf values)
function getNodeValue(node: CDTNode): number {
  if (node.value !== undefined) {
    return node.value;
  }
  if (!node.children || node.children.length === 0) {
    return 0;
  }
  return node.children.reduce((sum, child) => sum + getNodeValue(child), 0);
}

// Flatten hierarchy for the current level
function flattenLevel(node: CDTNode): { data: Array<{ name: string; value: number; color: string; id: string; hasChildren: boolean }>; total: number } {
  if (!node.children || node.children.length === 0) {
    return { data: [], total: node.value || 0 };
  }

  const data = node.children.map((child) => {
    const childValue = getNodeValue(child);
    return {
      id: child.id,
      name: child.name,
      value: childValue,
      color: getColor(child.name, node.color),
      hasChildren: Boolean(child.children && child.children.length > 0),
    };
  });

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return { data, total };
}

// Find node by path
function findNodeByPath(root: CDTNode, path: string[]): CDTNode | null {
  if (path.length === 0) return root;

  let current: CDTNode | null = root;
  for (const id of path) {
    if (!current?.children) return null;
    current = current.children.find((c) => c.id === id) || null;
    if (!current) return null;
  }
  return current;
}

// Custom active shape for pie chart
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#333" className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#666" className="text-xs">
        ${(value / 1000).toFixed(0)}K ({(percent * 100).toFixed(1)}%)
      </text>
    </g>
  );
};

export function SunburstChart({ data, isLoading }: SunburstChartProps) {
  const [path, setPath] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Get current node based on path
  const currentNode = useMemo(() => {
    return findNodeByPath(data, path);
  }, [data, path]);

  // Get flattened data for current level
  const { data: chartData, total } = useMemo(() => {
    if (!currentNode) return { data: [], total: 0 };
    return flattenLevel(currentNode);
  }, [currentNode]);

  // Build breadcrumb
  const breadcrumb = useMemo(() => {
    const items: Array<{ id: string; name: string; path: string[] }> = [
      { id: "root", name: data.name, path: [] }
    ];

    let current = data;
    const currentPath: string[] = [];

    for (const id of path) {
      const child = current.children?.find((c) => c.id === id);
      if (child) {
        currentPath.push(id);
        items.push({ id: child.id, name: child.name, path: [...currentPath] });
        current = child;
      }
    }

    return items;
  }, [data, path]);

  // Handle segment click (drill down)
  const handleClick = useCallback((entry: any) => {
    if (entry && entry.hasChildren) {
      setPath((prev) => [...prev, entry.id]);
      setActiveIndex(null);
    }
  }, []);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback((targetPath: string[]) => {
    setPath(targetPath);
    setActiveIndex(null);
  }, []);

  // Calculate insights
  const insights = useMemo(() => {
    if (chartData.length === 0) return null;

    const sorted = [...chartData].sort((a, b) => b.value - a.value);
    const topItem = sorted[0];
    const topShare = total > 0 ? (topItem.value / total) * 100 : 0;

    return {
      topItem: topItem.name,
      topShare,
      itemCount: chartData.length,
      level: breadcrumb.length,
    };
  }, [chartData, total, breadcrumb.length]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-full mx-auto" style={{ maxWidth: 400 }} />
        </CardContent>
      </Card>
    );
  }

  const levelNames = ["Category", "Subcategory", "Brand", "Size"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Category Hierarchy
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Click segments to drill down
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          {breadcrumb.map((item, index) => (
            <div key={item.id} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
              <Button
                variant={index === breadcrumb.length - 1 ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleBreadcrumbClick(item.path)}
              >
                {index === 0 && <Home className="h-3 w-3 mr-1" />}
                {item.name}
              </Button>
            </div>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            ({levelNames[breadcrumb.length - 1]} level)
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No data available at this level
          </div>
        ) : (
          <>
            <div className="w-full h-[400px]">
              <PieChart width={400} height={400} className="mx-auto">
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={150}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  activeIndex={activeIndex ?? undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(_, index) => handleClick(chartData[index])}
                  style={{ cursor: "pointer" }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="white"
                      strokeWidth={2}
                      style={{
                        opacity: entry.hasChildren ? 1 : 0.8,
                        cursor: entry.hasChildren ? "pointer" : "default"
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${(value / 1000).toFixed(0)}K (${((value / total) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {chartData.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => entry.hasChildren && handleClick(entry)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                    entry.hasChildren ? "hover:bg-muted cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                  {entry.hasChildren && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>

            {/* Insights */}
            {insights && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Hierarchy Insight:</strong> At this level,{" "}
                  <strong>{insights.topItem}</strong> leads with{" "}
                  <strong>{insights.topShare.toFixed(1)}%</strong> share across{" "}
                  {insights.itemCount} {levelNames[breadcrumb.length]?.toLowerCase() || "items"}.
                  {breadcrumb.length < 4 && " Click a segment to explore deeper."}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
