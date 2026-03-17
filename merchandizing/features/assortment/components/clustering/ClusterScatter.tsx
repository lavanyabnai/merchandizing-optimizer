"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import type { PCACoordinate } from "@/features/assortment/types";

// Cluster colors matching the Python implementation
const CLUSTER_COLORS = [
  "#E74C3C", // Red
  "#3498DB", // Blue
  "#2ECC71", // Green
  "#9B59B6", // Purple
  "#F39C12", // Orange
  "#1ABC9C", // Teal
  "#E91E63", // Pink
  "#00BCD4", // Cyan
  "#FF5722", // Deep Orange
  "#607D8B", // Blue Grey
];

interface ClusterScatterProps {
  data: PCACoordinate[];
  silhouetteScore?: number;
  nClusters: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PCACoordinate & { clusterName: string };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium text-sm">{point.storeCode}</p>
      <div className="mt-1 space-y-1 text-xs text-muted-foreground">
        <p>
          Cluster:{" "}
          <span
            className="font-medium"
            style={{ color: CLUSTER_COLORS[point.clusterId % CLUSTER_COLORS.length] }}
          >
            {point.clusterName || `Cluster ${point.clusterId}`}
          </span>
        </p>
        <p>
          Revenue: <span className="font-medium">${point.revenue.toLocaleString()}</span>
        </p>
        <p>
          PC1: <span className="font-medium">{point.pc1.toFixed(2)}</span>
        </p>
        <p>
          PC2: <span className="font-medium">{point.pc2.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}

export function ClusterScatter({
  data,
  silhouetteScore,
  nClusters,
}: ClusterScatterProps) {
  // Group data by cluster for separate scatter series
  const clusterData = useMemo(() => {
    const clusters: Record<number, (PCACoordinate & { clusterName: string })[]> = {};

    data.forEach((point) => {
      if (!clusters[point.clusterId]) {
        clusters[point.clusterId] = [];
      }
      clusters[point.clusterId].push({
        ...point,
        clusterName: `Cluster ${point.clusterId + 1}`,
      });
    });

    return clusters;
  }, [data]);

  // Calculate min/max for revenue to scale point sizes
  const revenueRange = useMemo(() => {
    const revenues = data.map((d) => d.revenue);
    return {
      min: Math.min(...revenues),
      max: Math.max(...revenues),
    };
  }, [data]);

  // Get silhouette quality label
  const getSilhouetteQuality = (score: number) => {
    if (score >= 0.5) return { label: "Excellent", variant: "default" as const };
    if (score >= 0.3) return { label: "Good", variant: "secondary" as const };
    if (score >= 0.1) return { label: "Fair", variant: "outline" as const };
    return { label: "Poor", variant: "destructive" as const };
  };

  const quality = silhouetteScore ? getSilhouetteQuality(silhouetteScore) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              Store Cluster Map
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              PCA projection - stores close together are similar
            </p>
          </div>
          {silhouetteScore !== undefined && (
            <div className="flex items-center gap-2">
              <Badge variant={quality?.variant}>
                Silhouette: {silhouetteScore.toFixed(3)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ({quality?.label})
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="pc1"
                name="PC1"
                label={{
                  value: "Principal Component 1",
                  position: "bottom",
                  offset: 0,
                  className: "text-xs fill-muted-foreground",
                }}
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="pc2"
                name="PC2"
                label={{
                  value: "Principal Component 2",
                  angle: -90,
                  position: "insideLeft",
                  className: "text-xs fill-muted-foreground",
                }}
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <ZAxis
                type="number"
                dataKey="revenue"
                range={[50, 400]}
                domain={[revenueRange.min, revenueRange.max]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => (
                  <span className="text-xs">{value}</span>
                )}
              />
              {Object.entries(clusterData).map(([clusterId, points]) => (
                <Scatter
                  key={clusterId}
                  name={`Cluster ${Number(clusterId) + 1}`}
                  data={points}
                  fill={CLUSTER_COLORS[Number(clusterId) % CLUSTER_COLORS.length]}
                  fillOpacity={0.8}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Info text */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Reading the Map:</strong> Each dot
          is a store. Stores clustered together share similar characteristics
          (sales patterns, customer preferences). Point size indicates store
          revenue. Hover over dots for details.
        </div>
      </CardContent>
    </Card>
  );
}
